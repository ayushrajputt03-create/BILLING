import React, { useState } from 'react';
import { TenantProvider, useTenant } from './context/TenantContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { POSBillingTerminal } from './components/pos/POSBillingTerminal';
import { InventoryManager } from './components/inventory/InventoryManager';
import { BranchManager } from './components/multistore/BranchManager';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { CustomerManager } from './components/customers/CustomerManager';
import { SuperAdminPortal } from './components/admin/SuperAdminPortal';
import { KeyboardShortcutsModal } from './components/pos/KeyboardShortcutsModal';
import './styles/retailbill.css';

const MainAppContent = () => {
  const { userRole, isOnline } = useTenant();
  const [activeTab, setActiveTab] = useState('pos');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans select-none pb-14 md:pb-0 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #060a14 0%, #0a0f1e 100%)' }}
    >
      {/* Animated Background Mesh */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {/* Emerald orb — top-left */}
        <div
          className="mesh-blob absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }}
        />
        {/* Sky orb — bottom-right */}
        <div
          className="mesh-blob absolute -bottom-40 -right-20 w-[480px] h-[480px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)', animationDelay: '-6s' }}
        />
        {/* Purple orb — mid */}
        <div
          className="mesh-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #c084fc 0%, transparent 70%)', animationDelay: '-12s' }}
        />
        {/* Fine grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Offline Connectivity Guard Banner */}
      {!isOnline && (
        <div className="relative z-50 bg-gradient-to-r from-amber-600 to-orange-600 text-slate-950 px-4 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md">
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
          <span>Offline Guard Mode Active — Transactions &amp; stock updates will queue locally and sync automatically when internet restores.</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar onOpenShortcuts={() => setIsShortcutsOpen(true)} />

      {/* App Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'pos' && <POSBillingTerminal />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'customers' && <CustomerManager />}
          {activeTab === 'multistore' && <BranchManager />}
          {activeTab === 'reports' && <ReportsDashboard />}
          {activeTab === 'admin' && <SuperAdminPortal />}
        </main>
      </div>

      {/* Mobile Bottom Dock */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <TenantProvider>
      <MainAppContent />
    </TenantProvider>
  );
}
