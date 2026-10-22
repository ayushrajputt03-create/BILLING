import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Calculator, 
  Package, 
  Building, 
  BarChart3, 
  ShieldCheck 
} from 'lucide-react';

export const MobileBottomNav = ({ activeTab, setActiveTab }) => {
  const { userRole, currentTenant } = useTenant();

  const navItems = [
    { id: 'pos', label: 'Billing', icon: Calculator, roles: ['Owner', 'Manager', 'Cashier', 'SuperAdmin'] },
    { id: 'inventory', label: 'Catalog', icon: Package, roles: ['Owner', 'Manager', 'SuperAdmin'] },
    { id: 'multistore', label: 'Stores', icon: Building, roles: ['Owner', 'Manager', 'SuperAdmin'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['Owner', 'Manager', 'SuperAdmin'] },
    { id: 'admin', label: 'SaaS Admin', icon: ShieldCheck, roles: ['SuperAdmin'] }
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Floating pill dock */}
      <div className="mx-3 mb-3 px-2 py-1.5 flex items-center justify-around bg-slate-900/90 backdrop-blur-2xl border border-white/8 rounded-2xl shadow-2xl shadow-black/50">
        {allowedItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {/* Icon with glow ring on active */}
              <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/15 border border-emerald-500/25 shadow-lg shadow-emerald-500/15'
                  : ''
              }`}>
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-emerald-400/10 animate-pulse" />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              {/* Label: only visible when active */}
              {isActive && (
                <span className="text-[9px] font-bold text-emerald-400 mt-0.5 leading-none tracking-wide">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
