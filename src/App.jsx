import React, { useState } from 'react';
import { TenantProvider, useTenant } from './context/TenantContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { POSBillingTerminal } from './components/pos/POSBillingTerminal';
import { InventoryManager } from './components/inventory/InventoryManager';
import { BranchManager } from './components/multistore/BranchManager';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { SuperAdminPortal } from './components/admin/SuperAdminPortal';
import { KeyboardShortcutsModal } from './components/pos/KeyboardShortcutsModal';
import './styles/retailbill.css';

const MainAppContent = () => {
  const { userRole, isOnline } = useTenant();
  const [activeTab, setActiveTab] = useState('pos');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Offline Connectivity Guard Banner */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-slate-950 px-4 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md">
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
          <span>Offline Guard Mode Active — Transactions & stock updates will queue locally and sync automatically when internet restores.</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar onOpenShortcuts={() => setIsShortcutsOpen(true)} />

      {/* App Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto bg-slate-950">
          {activeTab === 'pos' && <POSBillingTerminal />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'multistore' && <BranchManager />}
          {activeTab === 'reports' && <ReportsDashboard />}
          {activeTab === 'admin' && <SuperAdminPortal />}
        </main>
      </div>

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
