import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  ChevronLeft,
  ChevronRight,
  Box,
  Bot,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/ai-models', label: 'AI Models', icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-50 flex flex-col ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Box className="w-6 h-6 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-xl font-bold text-slate-800">ERP</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-slate-600">AD</span>
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-800 truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@erp.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}