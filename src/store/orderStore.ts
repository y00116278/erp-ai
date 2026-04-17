import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '@/types';

interface OrderStore {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  getOrder: (id: string) => Order | undefined;
}

const initialOrders: Order[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'John Smith',
    items: [
      { productId: '1', productName: 'Laptop Pro 15', quantity: 1, price: 1299.99 },
      { productId: '2', productName: 'Wireless Mouse', quantity: 2, price: 49.99 },
    ],
    total: 1399.97,
    status: 'delivered',
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '2',
    customerId: '2',
    customerName: 'Jane Doe',
    items: [
      { productId: '5', productName: 'Monitor 27"', quantity: 1, price: 449.99 },
    ],
    total: 449.99,
    status: 'processing',
    createdAt: '2024-01-21T10:00:00Z',
  },
  {
    id: '3',
    customerId: '3',
    customerName: 'Bob Wilson',
    items: [
      { productId: '4', productName: 'Mechanical Keyboard', quantity: 1, price: 149.99 },
      { productId: '3', productName: 'USB-C Hub', quantity: 1, price: 79.99 },
    ],
    total: 229.98,
    status: 'shipped',
    createdAt: '2024-01-22T09:15:00Z',
  },
  {
    id: '4',
    customerId: '4',
    customerName: 'Alice Brown',
    items: [
      { productId: '2', productName: 'Wireless Mouse', quantity: 3, price: 49.99 },
    ],
    total: 149.97,
    status: 'pending',
    createdAt: '2024-01-23T16:45:00Z',
  },
  {
    id: '5',
    customerId: '5',
    customerName: 'Charlie Davis',
    items: [
      { productId: '1', productName: 'Laptop Pro 15', quantity: 2, price: 1299.99 },
    ],
    total: 2599.98,
    status: 'delivered',
    createdAt: '2024-01-24T11:20:00Z',
  },
];

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: initialOrders,
  addOrder: (order) =>
    set((state) => ({
      orders: [
        ...state.orders,
        {
          ...order,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        },
      ],
    })),
  updateOrder: (id, order) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, ...order } : o
      ),
    })),
  deleteOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    })),
  getOrder: (id) => get().orders.find((o) => o.id === id),
}));