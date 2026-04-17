import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '@/types';

interface ProductStore {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
}

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro 15',
    description: 'High-performance laptop with 16GB RAM',
    category: 'Electronics',
    price: 1299.99,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking',
    category: 'Accessories',
    price: 49.99,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200',
    status: 'active',
    createdAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI and SD card reader',
    category: 'Accessories',
    price: 79.99,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=200',
    status: 'active',
    createdAt: '2024-01-17T10:00:00Z',
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with Cherry MX switches',
    category: 'Accessories',
    price: 149.99,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=200',
    status: 'active',
    createdAt: '2024-01-18T10:00:00Z',
  },
  {
    id: '5',
    name: 'Monitor 27"',
    description: '4K UHD monitor with HDR support',
    category: 'Electronics',
    price: 449.99,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200',
    status: 'active',
    createdAt: '2024-01-19T10:00:00Z',
  },
];

export const useProductStore = create<ProductStore>((set, get) => ({
  products: initialProducts,
  addProduct: (product) =>
    set((state) => ({
      products: [
        ...state.products,
        {
          ...product,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        },
      ],
    })),
  updateProduct: (id, product) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...product } : p
      ),
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  getProduct: (id) => get().products.find((p) => p.id === id),
}));