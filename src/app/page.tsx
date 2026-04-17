'use client';

import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import Link from 'next/link';
import { useProductStore } from '@/store/productStore';
import { useOrderStore } from '@/store/orderStore';
import { useCustomerStore } from '@/store/customerStore';
import { useTranslation } from '@/components/LanguageSwitcher';

export default function DashboardPage() {
  const products = useProductStore((s) => s.products);
  const orders = useOrderStore((s) => s.orders);
  const customers = useCustomerStore((s) => s.customers);
  const t = useTranslation();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = customers.length;

  const stats = [
    {
      label: t('totalRevenue'),
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
      color: 'bg-emerald-500',
    },
    {
      label: t('totalOrders'),
      value: totalOrders.toString(),
      icon: ShoppingCart,
      trend: '+8.2%',
      trendUp: true,
      color: 'bg-blue-500',
    },
    {
      label: t('totalProducts'),
      value: totalProducts.toString(),
      icon: Package,
      trend: '+3.1%',
      trendUp: true,
      color: 'bg-purple-500',
    },
    {
      label: t('totalCustomers'),
      value: totalCustomers.toString(),
      icon: Users,
      trend: '+5.7%',
      trendUp: true,
      color: 'bg-orange-500',
    },
  ];

  const quickActions = [
    { label: t('newOrder'), href: '/orders', icon: ShoppingCart },
    { label: t('addProduct'), href: '/products', icon: Package },
    { label: t('addCustomer'), href: '/customers', icon: Users },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('dashboard')}</h1>
        <p className="text-slate-500 mt-1">{t('welcomeBack')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {stat.trendUp ? (
                  <TrendingUp className="w-4 h-4 text-accent" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger" />
                )}
                <span className={`text-sm ${stat.trendUp ? 'text-accent' : 'text-danger'}`}>
                  {stat.trend}
                </span>
                <span className="text-sm text-slate-500">{t('vsLastMonth')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{t('quickActions')}</h2>
        <div className="flex gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                <Icon className="w-4 h-4" />
                <span className="font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{t('recentOrders')}</h2>
          <Link
            href="/orders"
            className="text-sm text-primary hover:text-primary-hover font-medium"
          >
            {t('viewAll')}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('orderId')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('customer')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('total')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('status')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">#{order.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.customerName}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {t(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}