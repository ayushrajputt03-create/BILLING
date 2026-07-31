import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  ArrowRightLeft, 
  Store, 
  X, 
  Truck,
  Sparkles
} from 'lucide-react';

export const BranchManager = () => {
  const { 
    currentTenant, 
    products, 
    stockTransfers, 
    initiateStockTransfer, 
    receiveStockTransfer,
    updateTenantPlan 
  } = useTenant();

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [fromBranchId, setFromBranchId] = useState(currentTenant.branches[0]?.id || '');
  const [toBranchId, setToBranchId] = useState(currentTenant.branches[1]?.id || currentTenant.branches[0]?.id || '');
  const [transferCart, setTransferCart] = useState([]);
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [transferQty, setTransferQty] = useState(10);

  const isStarter = currentTenant.plan === 'Starter';

  const handleAddTransferItem = () => {
    const prod = products.find(p => p.id === selectedProdId);
    if (!prod) return;

    setTransferCart(prev => {
      const exists = prev.find(i => i.productId === prod.id);
      if (exists) {
        return prev.map(i => i.productId === prod.id ? { ...i, qty: i.qty + Number(transferQty) } : i);
      }
      return [...prev, { productId: prod.id, name: prod.name, qty: Number(transferQty) }];
    });
  };

  const handleInitiateSubmit = (e) => {
    e.preventDefault();
    if (fromBranchId === toBranchId) {
      alert('Source and destination branch cannot be the same!');
      return;
    }
    if (transferCart.length === 0) {
      alert('Please add at least 1 item to transfer!');
      return;
    }

    initiateStockTransfer(fromBranchId, toBranchId, transferCart);
    setIsTransferModalOpen(false);
    setTransferCart([]);
    alert('Stock transfer initiated and items moved to In-Transit status!');
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Multi-Store & Branch Inventory</h2>
          <p className="text-xs text-slate-400">Consolidated stock visibility & inter-branch transfers</p>
        </div>

        {!isStarter && (
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Initiate Stock Transfer</span>
          </button>
        )}
      </div>

      {isStarter ? (
        <div className="glass-card p-6 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Multi-Store Feature (Growth Plan)</h3>
              <p className="text-xs text-slate-300">You are currently on the <span className="font-bold text-amber-400">Starter Plan</span> (1 Branch limit).</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Upgrade to the Growth or Enterprise Plan to manage up to 5+ branches with centralized stock transfers, consolidated reports, and branch-specific cashier permissions.
          </p>
          <button
            onClick={() => {
              if (confirm('Upgrade tenant plan from Starter to Growth Tier?')) {
                updateTenantPlan(currentTenant.id, 'Growth');
              }
            }}
            className="btn-primary text-xs flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upgrade to Growth Tier (₹1,499/mo)</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {currentTenant.branches.map((b, idx) => (
              <div key={b.id} className="glass-card p-4 space-y-2 border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    {b.code}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Active Outlet #{idx + 1}</span>
                </div>
                <h4 className="font-bold text-white text-sm">{b.name}</h4>
                <p className="text-xs text-slate-400">{b.address}</p>
                <p className="text-[11px] font-mono text-slate-500">Ph: {b.phone}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider text-slate-300">
              Cross-Branch Stock Matrix
            </h3>

            <div className="glass-card overflow-hidden border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3">Barcode</th>
                      <th className="p-3">Product Name</th>
                      {currentTenant.branches.map(b => (
                        <th key={b.id} className="p-3 text-center">{b.name}</th>
                      ))}
                      <th className="p-3 text-right">Total Combined Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {products.map(p => {
                      let totalCombined = 0;
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono text-emerald-400">{p.barcode}</td>
                          <td className="p-3 font-semibold text-white">{p.name}</td>
                          {currentTenant.branches.map(b => {
                            const bStock = p.stocks?.[b.id] ?? 0;
                            totalCombined += bStock;
                            return (
                              <td key={b.id} className="p-3 text-center font-mono font-bold">
                                <span className={bStock <= p.minStockAlert ? 'text-rose-400' : 'text-slate-200'}>
                                  {bStock} {p.unit}
                                </span>
                              </td>
                            );
                          })}
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">
                            {totalCombined} {p.unit}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider text-slate-300">
              Inter-Branch Stock Transfer Audit Log
            </h3>

            <div className="glass-card overflow-hidden border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-3">Transfer #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">From Branch</th>
                    <th className="p-3">To Branch</th>
                    <th className="p-3">Items Transferred</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {stockTransfers.map(tr => (
                    <tr key={tr.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-sky-400">{tr.transferNumber}</td>
                      <td className="p-3 text-slate-400">{tr.date}</td>
                      <td className="p-3 font-semibold text-slate-200">{tr.fromBranchName}</td>
                      <td className="p-3 font-semibold text-slate-200">{tr.toBranchName}</td>
                      <td className="p-3">
                        <div className="text-[11px] space-y-0.5">
                          {tr.items.map((i, idx) => (
                            <p key={idx} className="text-slate-300 font-mono">
                              • {i.name}: <span className="font-bold text-emerald-400">{i.qty}</span>
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tr.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}>
                          {tr.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {tr.status === 'In Transit' ? (
                          <button
                            onClick={() => {
                              receiveStockTransfer(tr.id);
                              alert(`Received stock for transfer ${tr.transferNumber} successfully!`);
                            }}
                            className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-xs font-bold"
                          >
                            Receive & Update Stock
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Received on {tr.receivedDate}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Initiate Inter-Branch Transfer</h3>
              </div>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Source Branch (From)</label>
                  <select
                    value={fromBranchId}
                    onChange={(e) => setFromBranchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {currentTenant.branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Branch (To)</label>
                  <select
                    value={toBranchId}
                    onChange={(e) => setToBranchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {currentTenant.branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Select Item & Quantity</label>
                <div className="flex gap-2">
                  <select
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stocks?.[fromBranchId] ?? 0})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={transferQty}
                    onChange={(e) => setTransferQty(e.target.value)}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white font-mono text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddTransferItem}
                    className="px-3 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500/30"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Items List ({transferCart.length})</p>
                {transferCart.map((i, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-800 text-xs text-slate-200">
                    <span>{i.name}</span>
                    <span className="font-mono font-bold text-emerald-400">{i.qty} units</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Dispatch Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
