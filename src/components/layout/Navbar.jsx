import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Building2, 
  Store, 
  UserCheck, 
  Wifi, 
  WifiOff, 
  Sun, 
  Moon, 
  Keyboard, 
  ChevronDown, 
  ShieldCheck, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ onOpenShortcuts }) => {
  const { 
    tenants, 
    currentTenant, 
    currentTenantId, 
    activeBranch, 
    currentBranchId, 
    userRole, 
    theme, 
    setTheme, 
    isOnline, 
    switchTenant, 
    switchBranch, 
    switchRole,
    resetDemoData
  } = useTenant();

  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Tenant Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Store className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg text-white font-display tracking-tight">Retail<span className="text-emerald-400">Bill</span></span>
              <span className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline-block">
                SaaS POS
              </span>
            </div>
            <p className="text-[9px] text-slate-400 hidden sm:block">Powered by NXT Elevata Media</p>
          </div>
        </div>

        {/* Tenant Switcher Pill */}
        {userRole !== 'SuperAdmin' && (
          <div className="relative ml-1 sm:ml-3">
            <button 
              onClick={() => { setShowTenantMenu(!showTenantMenu); setShowBranchMenu(false); setShowRoleMenu(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="text-left max-w-[110px] sm:max-w-none truncate">
                <p className="font-semibold text-xs leading-none truncate">{currentTenant.name}</p>
                <p className="text-[9px] text-slate-400 mt-0.5 hidden sm:block">{currentTenant.plan} Tier • {currentTenant.gstin}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {showTenantMenu && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 p-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Select Active Shop Sandbox</p>
                {tenants.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { switchTenant(t.id); setShowTenantMenu(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      t.id === currentTenantId ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-[10px] text-slate-400">{t.city} • {t.branches.length} Branch{t.branches.length > 1 ? 'es' : ''}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      t.plan === 'Enterprise' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      t.plan === 'Growth' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {t.plan}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Branch Switcher */}
        {userRole !== 'SuperAdmin' && currentTenant.branches.length > 1 && (
          <div className="relative hidden xl:block">
            <button 
              onClick={() => { setShowBranchMenu(!showBranchMenu); setShowTenantMenu(false); setShowRoleMenu(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200"
            >
              <Store className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div className="text-left">
                <span className="font-semibold text-sky-300">{activeBranch.name}</span>
                <span className="text-[10px] text-slate-400 ml-1">({activeBranch.code})</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showBranchMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Switch Branch Outlet</p>
                {currentTenant.branches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { switchBranch(b.id); setShowBranchMenu(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                      b.id === currentBranchId ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <p>{b.name}</p>
                    <p className="text-[10px] text-slate-400">{b.address}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Connectivity, Shortcuts, Role & Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
          isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
        }`}>
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Online SaaS</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline Guard</span>
            </>
          )}
        </div>

        <button 
          onClick={onOpenShortcuts}
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 transition-colors hidden lg:flex items-center gap-1 text-xs"
          title="POS Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4 text-emerald-400" />
          <span className="hidden xl:inline">Hotkeys</span>
        </button>

        {/* Demo Role Switcher */}
        <div className="relative">
          <button 
            onClick={() => { setShowRoleMenu(!showRoleMenu); setShowTenantMenu(false); setShowBranchMenu(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              userRole === 'SuperAdmin' 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {userRole === 'SuperAdmin' ? <ShieldCheck className="w-4 h-4 text-purple-400" /> : <UserCheck className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline">{userRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Switch Role (Demo)</p>
              {['Owner', 'Manager', 'Cashier', 'SuperAdmin'].map(r => (
                <button
                  key={r}
                  onClick={() => { switchRole(r); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    r === userRole ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  {r === 'SuperAdmin' ? 'NXT Elevata Super Admin' : `${r} Mode`}
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={() => { if(confirm('Reset mock database to default state?')) resetDemoData(); }}
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Reset Demo Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 transition-colors"
          title="Toggle Dark / Light mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};
