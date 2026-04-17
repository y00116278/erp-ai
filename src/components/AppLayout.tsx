'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AIAssistant from './AIAssistant';
import Notification from './Notification';
import { useUIStore } from '@/store/uiStore';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Header />
        <div className="p-6">{children}</div>
      </main>
      <AIAssistant />
      <Notification />
    </div>
  );
}