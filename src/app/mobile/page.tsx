'use client';

/**
 * Mobile AI Assistant Page
 *
 * Standalone mobile H5 page for AI Assistant functionality.
 * Full-screen chat interface optimized for mobile devices.
 */

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Settings, Brain, ChevronLeft, Mic, MicOff } from 'lucide-react';
import Link from 'next/link';
import { useProductStore } from '@/store/productStore';
import { useOrderStore } from '@/store/orderStore';
import { useCustomerStore } from '@/store/customerStore';
import { useTranslation } from '@/components/LanguageSwitcher';
import { detectIntent, getLLMConfig, setLLMConfig, type Intent } from '@/lib/aiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function MobileAIPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '你好！我是你的人工智能助理。我可以帮助您：\n\n• 查询ERP数据（订单、产品、客户）\n• 生成报告和见解\n• 执行添加记录等操作\n\n我能帮你什么忙吗？',
    },
  ]);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = useTranslation();
  const products = useProductStore((s) => s.products);
  const orders = useOrderStore((s) => s.orders);
  const customers = useCustomerStore((s) => s.customers);

  useEffect(() => {
    const config = getLLMConfig();
    setApiKey(config.apiKey);
    setModelName(config.modelName);
    setBaseUrl(config.baseUrl);

    // Initialize Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'zh-CN';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => prev + transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const executeAction = (intent: Intent, params?: Record<string, string>): string => {
    switch (intent) {
      case 'product_stats':
        return `📦 **Product Stats:**\n\n• ${t('totalProducts')}: ${products.length}\n• ${t('active')}: ${products.filter((p) => p.status === 'active').length}\n• ${t('outOfStock')}: ${products.filter((p) => p.stock === 0).length}\n• ${t('lowStock')}: ${products.filter((p) => p.stock > 0 && p.stock < 10).length}`;

      case 'product_low_stock': {
        const lowStock = products.filter((p) => p.stock < 10 && p.stock > 0);
        if (lowStock.length === 0) return '✅ No products with low stock!';
        return `⚠️ **${t('lowStockProducts')}:**\n\n${lowStock
          .map((p) => `• ${p.name}: ${p.stock} ${t('units')}`)
          .join('\n')}`;
      }

      case 'product_top_selling': {
        const productSales: Record<string, number> = {};
        orders.forEach((o) =>
          o.items.forEach((i) => {
            productSales[i.productName] = (productSales[i.productName] || 0) + i.quantity;
          })
        );
        const sorted = Object.entries(productSales).sort((a, b) => b[1] - a[1]);
        if (sorted.length === 0) return 'No sales data available yet.';
        return `🏆 **${t('topSellingProducts')}:**\n\n${sorted
          .slice(0, 5)
          .map(([name, qty], i) => `${i + 1}. ${name}: ${qty} sold`)
          .join('\n')}`;
      }

      case 'product_list':
        return `📦 **${t('products')}:**\n\n${products
          .slice(0, 5)
          .map((p) => `• ${p.name} - $${p.price.toFixed(2)} (${p.stock} in stock)`)
          .join('\n')}\n\nUse "show all products" for the complete list.`;

      case 'product_detail': {
        const productName = params?.productName || '';
        if (!productName) {
          return `🔍 **Product Detail**\n\nPlease specify a product name.\n\nExample: "Show details for iPhone 15"`;
        }
        const product = products.find(
          (p) => p.name.toLowerCase().includes(productName.toLowerCase())
        );
        if (!product) {
          return `🔍 **Product Detail**\n\nProduct "${productName}" not found.\n\nAvailable products:\n${products
            .slice(0, 10)
            .map((p) => `• ${p.name}`)
            .join('\n')}`;
        }
        const stockStatus =
          product.stock === 0
            ? t('outOfStock')
            : product.stock < 10
            ? t('lowStock')
            : t('inStock');
        const estimatedValue = product.price * product.stock;
        return `🔍 **Product Detail:**\n\n• **Name:** ${product.name}\n• **SKU:** ${product.id}\n• **Category:** ${product.category || '-'}\n• **Price:** $${product.price.toFixed(2)}\n• **Stock:** ${product.stock} ${t('units')} (${stockStatus})\n• **Status:** ${product.status === 'active' ? t('active') : t('inactive')}\n• **Estimated Value:** $${estimatedValue.toFixed(2)}\n${product.description ? `\n**Description:**\n${product.description}` : ''}`;
      }

      case 'order_stats':
        return `🛒 **${t('orders')} Stats:**\n\n• ${t('totalOrders')}: ${orders.length}\n• ${t('pending')}: ${orders.filter((o) => o.status === 'pending').length}\n• ${t('processing')}: ${orders.filter((o) => o.status === 'processing').length}\n• ${t('shipped')}: ${orders.filter((o) => o.status === 'shipped').length}\n• ${t('delivered')}: ${orders.filter((o) => o.status === 'delivered').length}`;

      case 'order_today': {
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
        return `🛒 **${t('recentOrders')}:**\n\n${orders
          .slice(0, 5)
          .map(
            (o) =>
              `• #${o.id}: ${o.customerName} - $${o.total.toFixed(2)} (${t(o.status)})`
          )
          .join('\n')}`;

      case 'customer_stats':
        return `👥 **${t('customers')} Stats:**\n\n• ${t('totalCustomers')}: ${customers.length}`;

      case 'customer_list':
        return `👥 **${t('customers')}:**\n\n${customers
          .slice(0, 5)
          .map((c) => `• ${c.name} - ${c.email}`)
          .join('\n')}`;

      case 'revenue_report': {
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const deliveredRevenue = orders
          .filter((o) => o.status === 'delivered')
          .reduce((sum, o) => sum + o.total, 0);
        return `💰 **${t('revenueReport')}:**\n\n• ${t('totalRevenue')}: $${totalRevenue.toFixed(2)}\n• ${t('delivered')}: $${deliveredRevenue.toFixed(2)}\n• ${t('pending')}: $${(totalRevenue - deliveredRevenue).toFixed(2)}`;
      }

      case 'dashboard_summary': {
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const activeProducts = products.filter((p) => p.status === 'active').length;
        return `📊 **${t('dashboardSummary')}:**\n\n• ${t('totalRevenue')}: $${totalRevenue.toFixed(2)}\n• ${t('totalOrders')}: ${orders.length}\n• ${t('active')}: ${activeProducts}\n• ${t('totalCustomers')}: ${customers.length}`;
      }

      case 'help':
        return `🤖 **${t('help')}:**\n\n• "Show ${t('products')}" / "How many ${t('products')}"\n• "Show ${t('orders')}" / "Today's ${t('orders')}"\n• "Show ${t('customers')}"\n• "Show product details for [name]"\n• "${t('revenueReport')}" / "Sales summary"\n• "${t('lowStockProducts')}"\n• "${t('topSellingProducts')}"\n• "${t('dashboardSummary')}"`;

      default:
        return '';
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    console.log(`[AI Conversation] ${new Date().toISOString()}`);
    console.log(`  User: ${userMessage}`);

    try {
      const config = getLLMConfig();
      const result = await detectIntent(userMessage, config);

      console.log(`  Intent: ${result.intent}`);
      if (result.parameters && Object.keys(result.parameters).length > 0) {
        console.log(`  Parameters: ${JSON.stringify(result.parameters)}`);
      }

      let response = '';

      if (result.intent && result.intent !== 'unknown') {
        response = executeAction(result.intent, result.parameters);
      }

      if (!response) {
        console.log('  Fallback: Using local keyword matching');
        const lowerQuery = userMessage.toLowerCase();

        if (lowerQuery.includes('product')) {
          if (lowerQuery.includes('how many') || lowerQuery.includes('total')) {
            response = executeAction('product_stats');
          } else if (lowerQuery.includes('detail') || lowerQuery.includes('info')) {
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

      if (!response) {
        response = `I didn't understand that. Try:\n\n• "Show ${t('products')}"\n• "Show ${t('orders')}"\n• "${t('revenueReport')}"\n• "${t('dashboardSummary')}"\n• "${t('help')}" for all commands`;
      }

      console.log(`  Response: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`);
      console.log('---');

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
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

  const handleSaveSettings = () => {
    setLLMConfig({ apiKey, modelName, baseUrl });
    setShowSettings(false);
  };

  const handleToggleVoice = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key first' });
      return;
    }
    setTestResult(null);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: 'Say "Connection successful!" if you can hear me.' }],
          max_tokens: 50,
        }),
      });

      if (response.ok) {
        setTestResult({ success: true, message: 'Connection successful!' });
      } else {
        const error = await response.text();
        setTestResult({ success: false, message: `Error: ${response.status}` });
      }
    } catch {
      setTestResult({ success: false, message: 'Connection failed' });
    }
  };

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-primary rounded-full shadow-lg flex items-center justify-center"
        >
          <MessageSquare className="w-7 h-7 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1 -ml-1 hover:bg-slate-100 rounded">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-800 text-lg">{t('aiAssistant')}</span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-slate-100 rounded-lg"
        >
          <Settings className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'ml-auto bg-primary text-white rounded-br-md'
                : 'bg-white text-slate-800 rounded-bl-md shadow-sm border border-slate-100'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100 flex items-center gap-2 max-w-[60%]">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            <span className="text-sm text-slate-500">{t('thinking')}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 p-3 pb-safe">
        <div className="flex gap-2">
          <button
            onClick={handleToggleVoice}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={t('askMeAnything')}
            className="flex-1 px-4 py-3 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-md sm:mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <span className="font-semibold text-slate-800">AI Settings</span>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-slate-100 rounded">
                <ChevronLeft className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base URL</label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Model Name</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="gpt-4o-mini"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    testResult.success
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleTest}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Test
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
