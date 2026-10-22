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
    <header className="h-[60px] border-b border-white/5 bg-slate-950/80 backdrop-blur-xl px-3 sm:px-5 flex items-center justify-between sticky top-0 z-40 shadow-lg shadow-black/20">
      {/* Brand & Tenant Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 glow-ring">
            <Store className="w-5 h-5 text-slate-950" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] tracking-tight text-white">
                Retail<span className="text-emerald-400">Bill</span>
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                POS
              </span>
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5">Powered by NXT Elevata Media</p>
          </div>
          {/* Mobile: just wordmark */}
          <span className="sm:hidden font-bold text-sm tracking-tight text-white">
            Retail<span className="text-emerald-400">Bill</span>
          </span>
        </div>

        {/* Tenant Switcher Pill */}
        {userRole !== 'SuperAdmin' && (
          <div className="relative ml-1 sm:ml-2">
            <button
              onClick={() => { setShowTenantMenu(!showTenantMenu); setShowBranchMenu(false); setShowRoleMenu(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/5 hover:border-white/10 text-xs text-slate-200 transition-all duration-150 group"
            >
              <div className="w-5 h-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Building2 className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-left max-w-[100px] sm:max-w-none truncate">
                <p className="font-semibold text-[11px] leading-none truncate text-slate-100">{currentTenant.name}</p>
                <p className="text-[9px] text-slate-400 mt-0.5 hidden sm:block">{currentTenant.plan} · {currentTenant.gstin}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
            </button>

            {showTenantMenu && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl shadow-black/40 z-50 p-2 animate-fade-slide-up">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1.5">Select Active Shop</p>
                {tenants.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { switchTenant(t.id); setShowTenantMenu(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors gap-2 ${
                      t.id === currentTenantId
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                        : 'hover:bg-slate-800/70 text-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{t.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.city} · {t.branches.length} Branch{t.branches.length > 1 ? 'es' : ''}</p>
                    </div>
                    <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      t.plan === 'Enterprise' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25' :
                      t.plan === 'Growth' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25' : 'bg-slate-800 text-slate-400 border border-slate-700'
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/5 hover:border-sky-500/20 text-xs text-slate-200 transition-all duration-150 group"
            >
              <Store className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div className="text-left">
                <span className="font-semibold text-sky-300">{activeBranch.name}</span>
                <span className="text-[10px] text-slate-400 ml-1">({activeBranch.code})</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </button>

            {showBranchMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl shadow-black/40 z-50 p-2 animate-fade-slide-up">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1.5">Switch Branch Outlet</p>
                {currentTenant.branches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { switchBranch(b.id); setShowBranchMenu(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors ${
                      b.id === currentBranchId
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/25 font-semibold'
                        : 'hover:bg-slate-800/70 text-slate-200'
                    }`}
                  >
                    <p>{b.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{b.address}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Connectivity Status */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all ${
          isOnline
            ? 'bg-emerald-500/8 text-emerald-400 border-emerald-500/15'
            : 'bg-amber-500/8 text-amber-400 border-amber-500/15 animate-pulse'
        }`}>
          {isOnline ? (
            <>
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>
                <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400"></span>
              </span>
              <Wifi className="w-3.5 h-3.5" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Keyboard Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200 transition-all hidden lg:flex items-center gap-1.5 text-xs"
          title="POS Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4 text-emerald-400" />
          <span className="hidden xl:inline text-slate-300">Hotkeys</span>
        </button>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => { setShowRoleMenu(!showRoleMenu); setShowTenantMenu(false); setShowBranchMenu(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 ${
              userRole === 'SuperAdmin'
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
                : 'bg-slate-900/70 text-slate-200 border-white/5 hover:bg-slate-800/80 hover:border-white/10'
            }`}
          >
            {userRole === 'SuperAdmin'
              ? <ShieldCheck className="w-4 h-4 text-purple-400" />
              : <UserCheck className="w-4 h-4 text-emerald-400" />
            }
            <span className="hidden sm:inline">{userRole}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showRoleMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/8 rounded-2xl shadow-2xl shadow-black/40 z-50 p-2 animate-fade-slide-up">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1.5">Switch Role (Demo)</p>
              {['Owner', 'Manager', 'Cashier', 'SuperAdmin'].map(r => (
                <button
                  key={r}
                  onClick={() => { switchRole(r); setShowRoleMenu(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    r === userRole
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                      : 'hover:bg-slate-800/70 text-slate-200'
                  }`}
                >
                  {r === 'SuperAdmin' ? 'NXT Elevata Super Admin' : `${r} Mode`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Demo */}
        <button
          onClick={() => { if(confirm('Reset mock database to default state?')) resetDemoData(); }}
          className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-white/5 hover:border-white/10 text-slate-500 hover:text-slate-200 transition-all"
          title="Reset Demo Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-white/5 hover:border-amber-500/20 text-amber-400 transition-all"
          title="Toggle Dark / Light mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-400" />}
        </button>
      </div>
    </header>
  );
};
