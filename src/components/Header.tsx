'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from './LanguageSwitcher';

export default function Header() {
  const pathname = usePathname();
  const t = useTranslation();

  const pathKeys: Record<string, any> = {
    '/': 'dashboard',
    '/products': 'products',
    '/orders': 'orders',
    '/customers': 'customers',
    '/inventory': 'inventory',
  };

  const pageLabel = pathKeys[pathname] ? t(pathKeys[pathname]) : 'Page';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Home className="w-4 h-4" />
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-800 font-medium">{pageLabel}</span>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
      </div>
    </header>
  );
}