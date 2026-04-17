'use client';

/**
 * AI Assistant Component
 *
 * Provides a natural language interface for querying ERP data.
 * Uses LLM for intent detection and falls back to keyword matching.
 *
 * Flow:
 * 1. User enters query → LLM detects intent (or keyword fallback)
 * 2. Intent maps to action → executeAction() fetches real data from stores
 * 3. Response displayed in chat panel
 *
 * Logs: All conversations are logged to console for debugging.
 */

import { useState } from 'react';
import { MessageSquare, X, Send, Loader2, Settings, Brain } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useOrderStore } from '@/store/orderStore';
import { useCustomerStore } from '@/store/customerStore';
import { useTranslation } from '@/components/LanguageSwitcher';
import { detectIntent, getLLMConfig, type Intent } from '@/lib/aiService';
import AISettings from './AISettings';

/** Chat message structure */
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * AI Assistant floating chat widget
 *
 * Features:
 * - Natural language query handling via LLM
 * - Local keyword matching as fallback
 * - Real-time data from Zustand stores
 * - Configurable LLM settings (API key, model, endpoint)
 */
export default function AIAssistant() {
  // UI state
  const [isOpen, setIsOpen] = useState(false);         // Chat panel visibility
  const [showSettings, setShowSettings] = useState(false); // Settings modal visibility
  const [isLoading, setIsLoading] = useState(false);   // Loading indicator
  const [input, setInput] = useState('');              // User input field

  // Initial welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "你好！我是你的人工智能助理。我可以帮助您：:\n\n• 查询ERP数据（订单、产品、客户）\n• 生成报告和见解\n• 执行添加记录等操作\n\n我能帮你什么忙吗？",
    },
  ]);

  // Get translation function for i18n
  const t = useTranslation();

  // Access ERP data stores
  const products = useProductStore((s) => s.products);
  const orders = useOrderStore((s) => s.orders);
  const customers = useCustomerStore((s) => s.customers);

  /**
   * Execute action based on detected intent
   * Fetches real data from Zustand stores and formats response
   *
   * @param intent - The detected user intent
   * @param params - Optional parameters from LLM (e.g., productName for product_detail)
   * @returns Formatted response string with real data
   */
  const executeAction = (intent: Intent, params?: Record<string, string>): string => {
    switch (intent) {
      case 'product_stats':
        // Return product statistics (counts by status)
        return `📦 **Product Stats:**\n\n• ${t('totalProducts')}: ${products.length}\n• ${t('active')}: ${products.filter((p) => p.status === 'active').length}\n• ${t('outOfStock')}: ${products.filter((p) => p.stock === 0).length}\n• ${t('lowStock')}: ${products.filter((p) => p.stock > 0 && p.stock < 10).length}`;

      case 'product_low_stock': {
        // Filter products with stock < 10 but > 0
        const lowStock = products.filter((p) => p.stock < 10 && p.stock > 0);
        if (lowStock.length === 0) return '✅ No products with low stock!';
        return `⚠️ **${t('lowStockProducts')}:**\n\n${lowStock
          .map((p) => `• ${p.name}: ${p.stock} ${t('units')}`)
          .join('\n')}`;
      }

      case 'product_top_selling': {
        // Calculate sales volume per product from order data
        const productSales: Record<string, number> = {};
        orders.forEach((o) =>
          o.items.forEach((i) => {
            productSales[i.productName] = (productSales[i.productName] || 0) + i.quantity;
          })
        );
        // Sort by quantity descending
        const sorted = Object.entries(productSales).sort((a, b) => b[1] - a[1]);
        if (sorted.length === 0) return 'No sales data available yet.';
        return `🏆 **${t('topSellingProducts')}:**\n\n${sorted
          .slice(0, 5)
          .map(([name, qty], i) => `${i + 1}. ${name}: ${qty} sold`)
          .join('\n')}`;
      }

      case 'product_list':
        // Return first 5 products with details
        return `📦 **${t('products')}:**\n\n${products
          .slice(0, 5)
          .map((p) => `• ${p.name} - $${p.price.toFixed(2)} (${p.stock} in stock)`)
          .join('\n')}\n\nUse "show all products" for the complete list.`;

      case 'product_detail': {
        // Get product name from LLM parameters
        const productName = params?.productName || '';

        if (!productName) {
          return `🔍 **Product Detail**\n\nPlease specify a product name.\n\nExample: "Show details for iPhone 15"`;
        }

        // Find matching product (case-insensitive partial match)
        const product = products.find(
          (p) => p.name.toLowerCase().includes(productName.toLowerCase())
        );

        if (!product) {
          return `🔍 **Product Detail**\n\nProduct "${productName}" not found.\n\nAvailable products:\n${products
  .slice(0, 10)
  .map((p) => `• ${p.name}`)
  .join('\n')}`;
        }

        // Get stock status
        const stockStatus =
          product.stock === 0
            ? t('outOfStock')
            : product.stock < 10
            ? t('lowStock')
            : t('inStock');

        // Calculate estimated inventory value
        const estimatedValue = product.price * product.stock;

        return `🔍 **Product Detail:**\n\n• **Name:** ${product.name}\n• **SKU:** ${product.id}\n• **Category:** ${product.category || '-'}\n• **Price:** $${product.price.toFixed(2)}\n• **Stock:** ${product.stock} ${t('units')} (${stockStatus})\n• **Status:** ${product.status === 'active' ? t('active') : t('inactive')}\n• **Estimated Value:** $${estimatedValue.toFixed(2)}\n${product.description ? `\n**Description:**\n${product.description}` : ''}`;
      }

      case 'order_stats':
        // Return order counts by status
        return `🛒 **${t('orders')} Stats:**\n\n• ${t('totalOrders')}: ${orders.length}\n• ${t('pending')}: ${orders.filter((o) => o.status === 'pending').length}\n• ${t('processing')}: ${orders.filter((o) => o.status === 'processing').length}\n• ${t('shipped')}: ${orders.filter((o) => o.status === 'shipped').length}\n• ${t('delivered')}: ${orders.filter((o) => o.status === 'delivered').length}`;

      case 'order_today': {
        // Filter orders created today
        const today = new Date().toDateString();
        const todayOrders = orders.filter(
          (o) => new Date(o.createdAt).toDateString() === today
        );
        return `📅 **Today's ${t('orders')}:** ${todayOrders.length}\n\n${
          todayOrders.length === 0
            ? 'No orders placed today.'
            : todayOrders
                .map(
                  (o) =>
                    `• ${t('orderId')} #${o.id}: ${o.customerName} - $${o.total.toFixed(2)} (${t(o.status)})`
                )
                .join('\n')
        }`;
      }

      case 'order_list':
        // Return first 5 recent orders
        return `🛒 **${t('recentOrders')}:**\n\n${orders
          .slice(0, 5)
          .map(
            (o) =>
              `• #${o.id}: ${o.customerName} - $${o.total.toFixed(2)} (${t(o.status)})`
          )
          .join('\n')}`;

      case 'customer_stats':
        // Return total customer count
        return `👥 **${t('customers')} Stats:**\n\n• ${t('totalCustomers')}: ${customers.length}`;

      case 'customer_list':
        // Return first 5 customers with basic info
        return `👥 **${t('customers')}:**\n\n${customers
          .slice(0, 5)
          .map((c) => `• ${c.name} - ${c.email}`)
          .join('\n')}`;

      case 'revenue_report': {
        // Calculate total and delivered revenue
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const deliveredRevenue = orders
          .filter((o) => o.status === 'delivered')
          .reduce((sum, o) => sum + o.total, 0);
        return `💰 **${t('revenueReport')}:**\n\n• ${t('totalRevenue')}: $${totalRevenue.toFixed(2)}\n• ${t('delivered')}: $${deliveredRevenue.toFixed(2)}\n• ${t('pending')}: $${(totalRevenue - deliveredRevenue).toFixed(2)}`;
      }

      case 'dashboard_summary': {
        // Overall dashboard metrics
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const activeProducts = products.filter((p) => p.status === 'active').length;
        return `📊 **${t('dashboardSummary')}:**\n\n• ${t('totalRevenue')}: $${totalRevenue.toFixed(2)}\n• ${t('totalOrders')}: ${orders.length}\n• ${t('active')}: ${activeProducts}\n• ${t('totalCustomers')}: ${customers.length}`;
      }

      case 'help':
        // List available commands
        return `🤖 **${t('help')}:**\n\n• "Show ${t('products')}" / "How many ${t('products')}"\n• "Show ${t('orders')}" / "Today's ${t('orders')}"\n• "Show ${t('customers')}"\n• "Show product details for [name]"\n• "${t('revenueReport')}" / "Sales summary"\n• "${t('lowStockProducts')}"\n• "${t('topSellingProducts')}"\n• "${t('dashboardSummary')}"`;

      default:
        return '';
    }
  };

  /**
   * Handle user message submission
   *
   * Flow:
   * 1. Add user message to chat
   * 2. Call LLM to detect intent
   * 3. Execute corresponding action to get real data
   * 4. Fall back to keyword matching if LLM fails
   * 5. Add assistant response to chat
   *
   * Logs both user queries and assistant responses to console.
   */
  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    // Clear input and add user message to chat
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Log user message for debugging
    console.log(`[AI Conversation] ${new Date().toISOString()}`);
    console.log(`  User: ${userMessage}`);

    try {
      // Get LLM configuration from localStorage or environment
      const config = getLLMConfig();

      // Call LLM to detect intent (intent only, response comes from local data)
      const result = await detectIntent(userMessage, config);

      // Log detected intent
      console.log(`  Intent: ${result.intent}`);
      if (result.parameters && Object.keys(result.parameters).length > 0) {
        console.log(`  Parameters: ${JSON.stringify(result.parameters)}`);
      }

      // Execute action based on detected intent to get real data
      let response = '';

      if (result.intent && result.intent !== 'unknown') {
        response = executeAction(result.intent, result.parameters);
      }

      // Fall back to local keyword matching if LLM didn't recognize intent
      if (!response) {
        console.log('  Fallback: Using local keyword matching');
        const lowerQuery = userMessage.toLowerCase();

        if (lowerQuery.includes('product')) {
          if (lowerQuery.includes('how many') || lowerQuery.includes('total')) {
            response = executeAction('product_stats');
          } else if (lowerQuery.includes('detail') || lowerQuery.includes('info')) {
            // Extract product name from query for detail lookup
            const match = lowerQuery.match(/(?:detail|info)\s+(?:of|for|about)?\s*(.+)/);
            const extractedName = match ? match[1].trim() : '';
            response = executeAction('product_detail', { productName: extractedName });
          } else if (lowerQuery.includes('low stock')) {
            response = executeAction('product_low_stock');
          } else if (lowerQuery.includes('best sell') || lowerQuery.includes('top')) {
            response = executeAction('product_top_selling');
          } else {
            response = executeAction('product_list');
          }
        } else if (lowerQuery.includes('order')) {
          if (lowerQuery.includes('how many') || lowerQuery.includes('total')) {
            response = executeAction('order_stats');
          } else if (lowerQuery.includes('today')) {
            response = executeAction('order_today');
          } else {
            response = executeAction('order_list');
          }
        } else if (lowerQuery.includes('customer')) {
          if (lowerQuery.includes('how many') || lowerQuery.includes('total')) {
            response = executeAction('customer_stats');
          } else {
            response = executeAction('customer_list');
          }
        } else if (
          lowerQuery.includes('revenue') ||
          lowerQuery.includes('sales') ||
          lowerQuery.includes('income')
        ) {
          response = executeAction('revenue_report');
        } else if (
          lowerQuery.includes('dashboard') ||
          lowerQuery.includes('overview') ||
          lowerQuery.includes('summary')
        ) {
          response = executeAction('dashboard_summary');
        } else if (lowerQuery.includes('help')) {
          response = executeAction('help');
        }
      }

      // If still no response, return generic help message
      if (!response) {
        response = `I didn't understand that. Try:\n\n• "Show ${t('products')}"\n• "Show ${t('orders')}"\n• "${t('revenueReport')}"\n• "${t('dashboardSummary')}"\n• "${t('help')}" for all commands`;
      }

      // Log assistant response
      console.log(`  Response: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`);
      console.log('---');

      // Add assistant response to chat
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      // Log error and show generic error message
      console.error('[AI Assistant Error]', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
        },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Action Button - Opens chat panel */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg hover:bg-primary-hover transition-colors flex items-center justify-center z-50"
        aria-label="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </button>

      {/* Chat Panel - Full conversation interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-50">
          {/* Header - Title, Settings, Close button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-800">{t('aiAssistant')}</span>
            </div>
            <div className="flex items-center gap-1">
              {/* Settings button - Opens AI configuration modal */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 hover:bg-slate-100 rounded"
                title="AI Settings"
              >
                <Settings className="w-4 h-4 text-slate-500" />
              </button>
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded"
                aria-label="Close chat"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Message List - Scrollable chat history */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'ml-auto bg-primary text-white'      // User messages right-aligned
                    : 'bg-slate-100 text-slate-800'          // Assistant messages left-aligned
                }`}
              >
                {msg.content}
              </div>
            ))}
            {/* Loading indicator while processing */}
            {isLoading && (
              <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                <span className="text-sm text-slate-500">{t('thinking')}</span>
              </div>
            )}
          </div>

          {/* Input Area - Text field and send button */}
          <div className="p-3 border-t border-slate-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={t('askMeAnything')}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal - Configure LLM API key, model, endpoint */}
      <AISettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
