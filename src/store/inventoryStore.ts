import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { StockChange } from '@/types';

interface InventoryStore {
  stockHistory: StockChange[];
  addStockChange: (change: Omit<StockChange, 'id' | 'createdAt'>) => void;
}

const initialStockHistory: StockChange[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Laptop Pro 15',
    change: 25,
    reason: 'Initial stock',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    productId: '2',
    productName: 'Wireless Mouse',
    change: 150,
    reason: 'Initial stock',
    createdAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    productId: '3',
    productName: 'USB-C Hub',
    change: 10,
    reason: 'Initial stock',
    createdAt: '2024-01-17T10:00:00Z',
  },
  {
    id: '4',
    productId: '1',
    productName: 'Laptop Pro 15',
    change: -1,
    reason: 'Order #1',
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '5',
    productId: '2',
    productName: 'Wireless Mouse',
    change: -2,
    reason: 'Order #1',
    createdAt: '2024-01-20T14:30:00Z',
  },
];

export const useInventoryStore = create<InventoryStore>((set) => ({
  stockHistory: initialStockHistory,
  addStockChange: (change) =>
    set((state) => ({
      stockHistory: [
        ...state.stockHistory,
        {
          ...change,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        },
      ],
    })),
}));