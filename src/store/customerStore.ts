import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from '@/types';

interface CustomerStore {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomer: (id: string) => Customer | undefined;
}

const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    address: '123 Main St, New York, NY 10001',
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    phone: '(555) 234-5678',
    address: '456 Oak Ave, Los Angeles, CA 90001',
    createdAt: '2024-01-11T10:00:00Z',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob.wilson@email.com',
    phone: '(555) 345-6789',
    address: '789 Pine Rd, Chicago, IL 60601',
    createdAt: '2024-01-12T10:00:00Z',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice.brown@email.com',
    phone: '(555) 456-7890',
    address: '321 Elm St, Houston, TX 77001',
    createdAt: '2024-01-13T10:00:00Z',
  },
  {
    id: '5',
    name: 'Charlie Davis',
    email: 'charlie.davis@email.com',
    phone: '(555) 567-8901',
    address: '654 Maple Dr, Phoenix, AZ 85001',
    createdAt: '2024-01-14T10:00:00Z',
  },
];

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: initialCustomers,
  addCustomer: (customer) =>
    set((state) => ({
      customers: [
        ...state.customers,
        {
          ...customer,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        },
      ],
    })),
  updateCustomer: (id, customer) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...customer } : c
      ),
    })),
  deleteCustomer: (id) =>
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    })),
  getCustomer: (id) => get().customers.find((c) => c.id === id),
}));