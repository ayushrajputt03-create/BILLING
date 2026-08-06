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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {allowedItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              isActive ? 'bg-emerald-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/20' : ''
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
