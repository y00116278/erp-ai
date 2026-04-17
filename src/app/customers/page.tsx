'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useCustomerStore } from '@/store/customerStore';
import { useOrderStore } from '@/store/orderStore';
import { useUIStore } from '@/store/uiStore';
import Modal from '@/components/Modal';
import { useTranslation } from '@/components/LanguageSwitcher';

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const orders = useOrderStore((s) => s.orders);
  const { showNotification, activeModal, openModal, closeModal, editingItem, setEditingItem } = useUIStore();
  const t = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerStats = (customerId: string) => {
    const customerOrders = orders.filter((o) => o.customerId === customerId);
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
    return { orderCount: customerOrders.length, totalSpent };
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
    };

    if (editingItem) {
      updateCustomer(editingItem.id, customerData);
      showNotification('success', t('customerUpdated'));
    } else {
      addCustomer(customerData);
      showNotification('success', t('customerAdded'));
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirm') + ' ' + t('delete') + '?')) {
      deleteCustomer(id);
      showNotification('success', t('customerDeleted'));
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    openModal('customer');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('customers')}</h1>
          <p className="text-slate-500 mt-1">{t('manageCustomerDatabase')}</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('addCustomer')}
        </button>
      </div>

      {/* Search */}
      <div className="flex-1 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={t('searchCustomers')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('fullName')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('email')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('phone')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('orderCount')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('totalSpent')}</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.map((customer) => {
                const stats = getCustomerStats(customer.id);
                return (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {customer.name.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium text-slate-800">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{customer.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{customer.phone}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{stats.orderCount}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">${stats.totalSpent.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(customer);
                            openModal('customer');
                          }}
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="p-1.5 text-slate-500 hover:text-danger hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {activeModal === 'customer' && (
        <Modal title={editingItem ? t('editCustomer') : t('addCustomer')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('fullName')}</label>
              <input
                name="name"
                required
                defaultValue={editingItem?.name}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('email')}</label>
              <input
                name="email"
                type="email"
                required
                defaultValue={editingItem?.email}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('phone')}</label>
              <input
                name="phone"
                required
                defaultValue={editingItem?.phone}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('address')}</label>
              <textarea
                name="address"
                rows={3}
                defaultValue={editingItem?.address}
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
                {editingItem ? t('update') : t('add')} {t('customers')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}