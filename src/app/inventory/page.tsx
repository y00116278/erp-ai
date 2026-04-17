'use client';

import { useState } from 'react';
import { Plus, AlertTriangle, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useUIStore } from '@/store/uiStore';
import Modal from '@/components/Modal';
import { useTranslation } from '@/components/LanguageSwitcher';

export default function InventoryPage() {
  const { products, updateProduct } = useProductStore();
  const { stockHistory, addStockChange } = useInventoryStore();
  const { showNotification, activeModal, openModal, closeModal } = useUIStore();
  const t = useTranslation();

  const [filter, setFilter] = useState('all');

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < 10);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  const handleStockAdjust = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productId = formData.get('productId') as string;
    const change = parseInt(formData.get('change') as string);
    const reason = formData.get('reason') as string;

    const product = products.find((p) => p.id === productId);
    if (product) {
      const newStock = Math.max(0, product.stock + change);
      updateProduct(productId, { stock: newStock });
      addStockChange({
        productId,
        productName: product.name,
        change,
        reason,
      });
      showNotification('success', t('stockAdjusted'));
      closeModal();
    }
  };

  const openAdjustModal = () => {
    openModal('adjustStock');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('inventory')}</h1>
          <p className="text-slate-500 mt-1">{t('manageStockLevels')}</p>
        </div>
        <button
          onClick={openAdjustModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('adjustStock')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('totalProducts')}</p>
              <p className="text-2xl font-bold text-slate-800">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('totalStock')}</p>
              <p className="text-2xl font-bold text-slate-800">
                {products.reduce((sum, p) => sum + p.stock, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('lowStock')}</p>
              <p className="text-2xl font-bold text-slate-800">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-danger rounded-lg">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('outOfStock')}</p>
              <p className="text-2xl font-bold text-slate-800">{outOfStockProducts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">{t('lowStock')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg p-3 border border-yellow-100">
                <p className="font-medium text-slate-800">{product.name}</p>
                <p className="text-sm text-yellow-600">Only {product.stock} {t('units')} left</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {['all', 'lowStock', 'outOfStock'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === tab
                ? 'bg-primary text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab === 'all' ? t('allProducts') : tab === 'lowStock' ? t('lowStock') : t('outOfStock')}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('product')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('category')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('currentStock')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products
                .filter((p) => {
                  if (filter === 'lowStock') return p.stock > 0 && p.stock < 10;
                  if (filter === 'outOfStock') return p.stock === 0;
                  return true;
                })
                .map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="font-medium text-slate-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{product.stock} {t('units')}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-800'
                            : product.stock < 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {product.stock === 0 ? t('outOfStock') : product.stock < 10 ? t('lowStock') : t('inStock')}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">{t('stockHistory')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('product')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('quantityChange')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('reason')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stockHistory.slice(0, 10).map((change) => (
                <tr key={change.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-800">{change.productName}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${change.change > 0 ? 'text-accent' : 'text-danger'}`}>
                      {change.change > 0 ? '+' : ''}{change.change}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{change.reason}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(change.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {activeModal === 'adjustStock' && (
        <Modal title={t('adjustStockTitle')}>
          <form onSubmit={handleStockAdjust} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('product')}</label>
              <select
                name="productId"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">{t('selectProductOption')}</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Current: {product.stock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('quantityChange')}</label>
              <input
                name="change"
                type="number"
                required
                placeholder={t('quantityChangeHelp')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('reason')}</label>
              <input
                name="reason"
                required
                placeholder="e.g., Restock, Damaged, Sold"
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
                {t('adjustStock')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}