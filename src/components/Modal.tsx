'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
}

export default function Modal({ title, children, onClose }: ModalProps) {
  const { closeModal } = useUIStore();

  const handleClose = () => {
    if (onClose) onClose();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}