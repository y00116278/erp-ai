'use client';

import { useState } from 'react';
import { Plus, Search, Eye, Edit2, Trash2 } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import { useProductStore } from '@/store/productStore';
import { useCustomerStore } from '@/store/customerStore';
import { useUIStore } from '@/store/uiStore';
import Modal from '@/components/Modal';
import { useTranslation } from '@/components/LanguageSwitcher';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const { orders, addOrder, updateOrder, deleteOrder } = useOrderStore();
  const { products } = useProductStore();
  const { customers } = useCustomerStore();
  const { showNotification, activeModal, openModal, closeModal, editingItem, setEditingItem } = useUIStore();
  const t = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState<any>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerId = formData.get('customerId') as string;
    const customer = customers.find((c) => c.id === customerId);

    const selectedProducts = formData.get('products') as string;
    const quantities = formData.get('quantities') as string;

    const productIds = selectedProducts.split(',').filter(Boolean);
    const qtyArray = quantities.split(',').map(Number);

    const items = productIds.map((pid, idx) => {
      const product = products.find((p) => p.id === pid);
      return {
        productId: pid,
        productName: product?.name || 'Unknown',
        quantity: qtyArray[idx] || 1,
        price: product?.price || 0,
      };
    });

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
      customerId,
      customerName: customer?.name || 'Unknown',
      items,
      total,
      status: 'pending' as const,
    };

    if (editingItem) {
      updateOrder(editingItem.id, orderData);
      showNotification('success', t('orderUpdated'));
    } else {
      addOrder(orderData);
      showNotification('success', t('orderCreated'));
    }
    closeModal();
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrder(orderId, { status: newStatus as any });
    showNotification('success', `${t('orderStatusUpdated')} ${t(newStatus as any)}!`);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirm') + ' ' + t('delete') + '?')) {
      deleteOrder(id);
      showNotification('success', t('orderDeleted'));
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    openModal('order');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('orders')}</h1>
          <p className="text-slate-500 mt-1">{t('manageCustomerOrders')}</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('newOrder')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchOrders')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
        >
          <option value="all">{t('allStatuses')}</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {t(status as any)}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('orderId')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('customer')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('items')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('total')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('status')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('date')}</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">#{order.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.customerName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {order.items.length} {t('items')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {t(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewOrder(order)}
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="p-1.5 text-slate-500 hover:text-danger hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {activeModal === 'order' && (
        <Modal title={editingItem ? t('editOrder') : t('newOrder')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('customer')}</label>
              <select
                name="customerId"
                required
                defaultValue={editingItem?.customerId}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">{t('selectCustomer')}</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('products')}</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2">
                {products.map((product) => (
                  <label key={product.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded">
                    <input
                      type="checkbox"
                      name="selectedProducts"
                      value={product.id}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">{product.name}</span>
                    <span className="text-xs text-slate-500">(${product.price.toFixed(2)})</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('quantity')}</label>
              <input
                name="quantities"
                type="text"
                placeholder={t('quantitiesHelp')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
              >
                {editingItem ? t('update') : t('createOrder')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Order Modal */}
      {viewOrder && (
        <Modal title={`${t('orderId')} #${viewOrder.id}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">{t('customer')}</p>
                <p className="font-medium text-slate-800">{viewOrder.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">{t('date')}</p>
                <p className="font-medium text-slate-800">{new Date(viewOrder.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-2">{t('items')}</p>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{t('product')}</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{t('quantity')}</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{t('price')}</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">{t('total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {viewOrder.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.productName}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.quantity}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">${item.price.toFixed(2)}</td>
                        <td className="px-3 py-2 text-sm text-slate-700 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div>
                <p className="text-sm text-slate-500">{t('status')}</p>
                <select
                  value={viewOrder.status}
                  onChange={(e) => handleStatusChange(viewOrder.id, e.target.value)}
                  className="mt-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {t(status as any)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">{t('total')}</p>
                <p className="text-xl font-bold text-slate-800">${viewOrder.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setViewOrder(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}