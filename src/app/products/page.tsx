'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useUIStore } from '@/store/uiStore';
import Modal from '@/components/Modal';
import { useTranslation } from '@/components/LanguageSwitcher';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { showNotification, activeModal, openModal, closeModal, editingItem, setEditingItem } = useUIStore();
  const t = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      image: formData.get('image') as string || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
      status: (formData.get('status') as 'active' | 'inactive') || 'active',
    };

    if (editingItem) {
      updateProduct(editingItem.id, productData);
      showNotification('success', t('productUpdated'));
    } else {
      addProduct(productData);
      showNotification('success', t('productAdded'));
    }
    closeModal();
  };

  const handleEdit = (product: any) => {
    setEditingItem(product);
    openModal('product');
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirm') + ' ' + t('deleteProduct') + '?')) {
      deleteProduct(id);
      showNotification('success', t('productDeleted'));
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    openModal('product');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('products')}</h1>
          <p className="text-slate-500 mt-1">{t('manageProductInventory')}</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('addProduct')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchProducts')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? t('allCategories') : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('product')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('category')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('price')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('stock')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{t('status')}</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${product.stock < 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'}`}>
                      {product.stock} {t('units')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {t(product.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
      {activeModal === 'product' && (
        <Modal title={editingItem ? t('editProduct') : t('addProduct')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('productName')}</label>
              <input
                name="name"
                required
                defaultValue={editingItem?.name}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('description')}</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={editingItem?.description}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('category')}</label>
                <select
                  name="category"
                  required
                  defaultValue={editingItem?.category || 'Electronics'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="Electronics">{t('category')}</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Software">Software</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('price')}</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={editingItem?.price}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('stock')}</label>
                <input
                  name="stock"
                  type="number"
                  required
                  defaultValue={editingItem?.stock}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('status')}</label>
                <select
                  name="status"
                  defaultValue={editingItem?.status || 'active'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="active">{t('active')}</option>
                  <option value="inactive">{t('inactive')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('imageUrl')}</label>
              <input
                name="image"
                type="url"
                defaultValue={editingItem?.image}
                placeholder="https://..."
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
                {editingItem ? t('update') : t('add')} {t('product')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}