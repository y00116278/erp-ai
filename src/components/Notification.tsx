'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function Notification() {
  const { notification, clearNotification } = useUIStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  if (!notification) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-accent" />,
    error: <XCircle className="w-5 h-5 text-danger" />,
    info: <Info className="w-5 h-5 text-primary" />,
  };

  const colors = {
    success: 'bg-green-50 border-accent',
    error: 'bg-red-50 border-danger',
    info: 'bg-blue-50 border-primary',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[notification.type]} shadow-lg`}>
        {icons[notification.type]}
        <span className="text-sm font-medium text-slate-800">{notification.message}</span>
        <button onClick={clearNotification} className="ml-2 p-1 hover:bg-slate-200 rounded">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
}