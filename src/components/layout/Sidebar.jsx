import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Calculator, 
  Package, 
  Building, 
  BarChart3, 
  ShieldCheck 
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { userRole, currentTenant } = useTenant();

  const navItems = [
    { id: 'pos', label: 'POS Billing', icon: Calculator, badge: 'F2', roles: ['Owner', 'Manager', 'Cashier', 'SuperAdmin'] },
    { id: 'inventory', label: 'Inventory & Catalog', icon: Package, badge: null, roles: ['Owner', 'Manager', 'SuperAdmin'] },
    { id: 'multistore', label: 'Multi-Store & Transfers', icon: Building, badge: currentTenant.plan !== 'Starter' ? 'Pro' : null, roles: ['Owner', 'Manager', 'SuperAdmin'] },
    { id: 'reports', label: 'GST & Sales Reports', icon: BarChart3, badge: 'Tax', roles: ['Owner', 'Manager', 'SuperAdmin'] },
    { id: 'admin', label: 'Platform Super Admin', icon: ShieldCheck, badge: 'SaaS', roles: ['SuperAdmin'] }
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-16 md:w-56 bg-slate-950/60 backdrop-blur border-r border-white/5 flex flex-col justify-between py-3 select-none shrink-0">
      {/* Top fade overlay */}
      <div className="pointer-events-none absolute top-0 left-0 w-16 md:w-56 h-8 bg-gradient-to-b from-slate-950/40 to-transparent z-10" />

      <div className="space-y-0.5 px-2">
        <p className="px-2 py-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest hidden md:block">
          Navigation
        </p>

        {allowedItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`relative w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/5 text-emerald-300 border border-emerald-500/20 shadow-sm shadow-emerald-500/10'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {/* Active left accent */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-emerald-400" />
              )}

              {/* Icon */}
              <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-800/60'
              }`}>
                <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.5 : 2} />
              </div>

              {/* Label */}
              <span className="hidden md:block font-semibold text-[13px] truncate">{item.label}</span>

              {/* Badge */}
              {item.badge && (
                <span className={`hidden md:inline-block ml-auto text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-500 border border-slate-700/60'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Plan Card */}
      <div className="hidden md:block mx-2 p-3 rounded-xl bg-slate-900/70 border border-white/5 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-200 text-[13px]">{currentTenant.plan} Plan</span>
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">Active</span>
        </div>

        {currentTenant.plan !== 'Starter' && (
          <>
            <p className="text-[10px] text-slate-400 mb-1.5">
              {currentTenant.branches.length} / {currentTenant.maxBranches} Outlets
            </p>
            {/* Usage bar */}
            <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                style={{ width: `${Math.min((currentTenant.branches.length / currentTenant.maxBranches) * 100, 100)}%` }}
              />
            </div>
          </>
        )}
        {currentTenant.plan === 'Starter' && (
          <p className="text-[10px] text-slate-500">Single Store POS</p>
        )}
      </div>
    </aside>
  );
};
