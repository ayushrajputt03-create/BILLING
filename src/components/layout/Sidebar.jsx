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
    <aside className="w-16 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-3 select-none">
      <div className="space-y-1">
        <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:block">
          Main Navigation
        </p>

        {allowedItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`hidden md:inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="hidden md:block p-3 rounded-xl bg-slate-800/60 border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-slate-200">{currentTenant.plan} Plan</span>
          <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
        </div>
        <p className="text-[11px] text-slate-400">
          {currentTenant.plan === 'Starter' ? 'Single Store POS' : `${currentTenant.branches.length} / ${currentTenant.maxBranches} Outlets Active`}
        </p>
      </div>
    </aside>
  );
};
