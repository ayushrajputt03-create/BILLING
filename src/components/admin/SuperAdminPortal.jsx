import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  ShieldCheck, 
  Building2, 
  DollarSign, 
  Activity, 
  Plus, 
  Sparkles,
  X,
  Store
} from 'lucide-react';

export const SuperAdminPortal = () => {
  const { tenants, addNewTenant, updateTenantPlan, switchTenant } = useTenant();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    plan: 'Starter',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    gstin: '27AAAAA0000A1Z5',
    address: 'Main Street'
  });

  let mrr = 0;
  tenants.forEach(t => {
    if (t.plan === 'Enterprise') mrr += 4999;
    else if (t.plan === 'Growth') mrr += 1499;
    else mrr += 499;
  });

  const handleCreateTenant = (e) => {
    e.preventDefault();
    if (!form.name || !form.ownerName) {
      alert('Shop Name and Owner Name are required');
      return;
    }
    addNewTenant(form);
    setIsAddModalOpen(false);
    alert(`Tenant "${form.name}" onboarded successfully! Switched to new tenant instance.`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="glass-card p-6 border-purple-500/30 bg-gradient-to-r from-purple-900/30 via-slate-900 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-display">NXT Elevata Media — SaaS Admin Portal</h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">Platform-wide multi-tenant provisioning, subscription tiers & SaaS telemetry</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 shadow-purple-500/25 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Tenant Shop</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 space-y-2 border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Total Active Tenants</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">{tenants.length}</p>
          <p className="text-[10px] text-slate-400">Isolated Shop Sandboxes</p>
        </div>

        <div className="glass-card p-4 space-y-2 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Monthly Recurring Revenue (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">₹{mrr.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400">Subscription Cashflow</p>
        </div>

        <div className="glass-card p-4 space-y-2 border-sky-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">System Reliability Uptime SLA</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">99.98%</p>
          <p className="text-[10px] text-emerald-400 font-semibold">● Cloud Sync Operational (&lt;15ms)</p>
        </div>

        <div className="glass-card p-4 space-y-2 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Growth & Enterprise Share</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {Math.round((tenants.filter(t => t.plan !== 'Starter').length / tenants.length) * 100)}%
          </p>
          <p className="text-[10px] text-slate-400">Multi-Branch Outlets</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider text-slate-300">
          Platform Tenant Directory & Subscription Management
        </h3>

        <div className="glass-card overflow-hidden border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Shop / Tenant Name</th>
                  <th className="p-3">Owner Contact</th>
                  <th className="p-3">City & State</th>
                  <th className="p-3">Plan Tier</th>
                  <th className="p-3 text-center">Branches</th>
                  <th className="p-3">GSTIN</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tenants.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="p-3">
                      <p className="font-bold text-white">{t.name}</p>
                      <p className="text-[10px] font-mono text-slate-500">ID: {t.id}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-200">{t.ownerName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{t.ownerPhone}</p>
                    </td>
                    <td className="p-3 font-semibold text-slate-300">{t.city}, {t.state}</td>
                    <td className="p-3">
                      <select
                        value={t.plan}
                        onChange={(e) => updateTenantPlan(t.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded bg-slate-900 border ${
                          t.plan === 'Enterprise' ? 'text-purple-400 border-purple-500/40' :
                          t.plan === 'Growth' ? 'text-sky-400 border-sky-500/40' : 'text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="Starter">Starter (₹499/mo)</option>
                        <option value="Growth">Growth (₹1,499/mo)</option>
                        <option value="Enterprise">Enterprise (₹4,999/mo)</option>
                      </select>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-sky-400">
                      {t.branches.length} / {t.maxBranches}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{t.gstin}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => switchTenant(t.id)}
                        className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded text-xs font-bold"
                      >
                        Enter Tenant Context
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Onboard New Retail Tenant</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Shop / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Laxmi Departmental Store"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subscription Plan</label>
                  <select
                    value={form.plan}
                    onChange={(e) => setForm({ ...form, plan: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Starter">Starter (Single Store)</option>
                    <option value="Growth">Growth (Up to 5 Outlets)</option>
                    <option value="Enterprise">Enterprise (Unlimited Outlets)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Mobile No</label>
                  <input
                    type="text"
                    value={form.ownerPhone}
                    onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                    placeholder="+91 98000 11122"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={form.gstin}
                    onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                    placeholder="27AAAAA0000A1Z5"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/25"
                >
                  Provision Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
