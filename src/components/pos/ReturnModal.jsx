import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  RotateCcw, 
  Search, 
  X, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  Minus, 
  Plus, 
  IndianRupee, 
  CreditCard, 
  Banknote, 
  QrCode, 
  RefreshCw,
  PackageCheck,
  CheckCircle2,
  Calendar,
  User
} from 'lucide-react';

export const ReturnModal = ({ isOpen, onClose, invoices: propInvoices }) => {
  const { invoices: contextInvoices, createReturn } = useTenant();
  const invoices = propInvoices || contextInvoices || [];

  const [step, setStep] = useState(1); // 1: Select Invoice, 2: Select Items & Qty, 3: Refund Details, 4: Success
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Return items state: map of productId -> { selected: boolean, qty: number, price: number, name: string }
  const [returnItemsState, setReturnItemsState] = useState({});
  const [refundMode, setRefundMode] = useState('Cash'); // Cash, UPI, Adjust
  const [returnReason, setReturnReason] = useState('Defective / Damaged');
  const [customReasonNote, setCustomReasonNote] = useState('');
  const [completedReturn, setCompletedReturn] = useState(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSearchQuery('');
      setSelectedInvoice(null);
      setReturnItemsState({});
      setRefundMode('Cash');
      setReturnReason('Defective / Damaged');
      setCustomReasonNote('');
      setCompletedReturn(null);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Step 1: Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(q)) ||
      (inv.customerPhone && inv.customerPhone.includes(q))
    );
  }).slice(0, 10); // Show top 10

  const handleSelectInvoice = (inv) => {
    setSelectedInvoice(inv);
    // Initialize return items map
    const initialMap = {};
    inv.items.forEach(item => {
      initialMap[item.productId] = {
        selected: true, // Default checked
        qty: 1, // Default 1
        maxQty: item.qty,
        price: item.price,
        name: item.name,
        unit: item.unit || 'pcs'
      };
    });
    setReturnItemsState(initialMap);
    setStep(2);
  };

  const toggleItemSelection = (productId) => {
    setReturnItemsState(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        selected: !prev[productId]?.selected
      }
    }));
  };

  const updateItemQty = (productId, delta) => {
    setReturnItemsState(prev => {
      const current = prev[productId];
      if (!current) return prev;
      const newQty = Math.max(1, Math.min(current.maxQty, current.qty + delta));
      return {
        ...prev,
        [productId]: {
          ...current,
          qty: newQty
        }
      };
    });
  };

  // Calculate refund subtotal
  const selectedItemsToReturn = Object.entries(returnItemsState)
    .filter(([_, item]) => item.selected && item.qty > 0)
    .map(([productId, item]) => ({
      productId,
      name: item.name,
      qty: item.qty,
      price: item.price
    }));

  const totalRefundAmount = selectedItemsToReturn.reduce(
    (sum, item) => sum + (item.price * item.qty),
    0
  );

  const handleSubmitReturn = (e) => {
    e.preventDefault();
    if (selectedItemsToReturn.length === 0) {
      alert('Please select at least one item to return.');
      return;
    }

    const fullReason = customReasonNote 
      ? `${returnReason} - ${customReasonNote}` 
      : returnReason;

    const result = createReturn(
      selectedInvoice.id,
      selectedItemsToReturn,
      refundMode,
      fullReason
    );

    if (result) {
      setCompletedReturn(result);
      setStep(4);
    }
  };

  const presetReasons = [
    'Defective / Damaged',
    'Expired Product',
    'Customer Changed Mind',
    'Wrong Item Billed',
    'Quality Unsatisfactory'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                Sales Return &amp; Product Refund
              </h3>
              <p className="text-[11px] text-slate-400">
                {step === 1 && 'Step 1 of 3: Locate original tax invoice'}
                {step === 2 && 'Step 2 of 3: Select items & quantity to restock'}
                {step === 3 && 'Step 3 of 3: Choose refund mode & reason'}
                {step === 4 && 'Return Successfully Processed & Stock Restocked'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: Search & Pick Invoice */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search original invoice number or customer phone/name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500 font-medium"
                />
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Invoice to Return:
                </p>
                {filteredInvoices.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 rounded-xl bg-slate-800/30 border border-slate-800">
                    <AlertCircle className="w-8 h-8 mx-auto mb-1 text-slate-600" />
                    <p className="text-xs font-semibold">No matching invoices found</p>
                    <p className="text-[10px] text-slate-500">Check the invoice number or mobile number</p>
                  </div>
                ) : (
                  filteredInvoices.map(inv => (
                    <button
                      key={inv.id}
                      onClick={() => handleSelectInvoice(inv)}
                      className="w-full p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 text-left transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400 text-xs group-hover:text-emerald-300">
                            {inv.invoiceNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950 text-slate-300 border border-slate-700">
                            {inv.paymentMode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium truncate">
                          {inv.customerName || 'Walk-in Customer'} {inv.customerPhone && `(${inv.customerPhone})`}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{new Date(inv.timestamp).toLocaleString('en-IN')}</span>
                          <span>• {inv.items?.length || 0} line item(s)</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2">
                        <div>
                          <p className="font-mono font-bold text-white text-sm">
                            ₹{inv.grandTotal.toFixed(2)}
                          </p>
                          <span className="text-[10px] text-slate-400">Total Billed</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Select Items & Quantities to Return */}
          {step === 2 && selectedInvoice && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Original Invoice:</span>
                  <p className="font-mono font-bold text-emerald-400">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Customer:</span>
                  <p className="font-semibold text-slate-200">{selectedInvoice.customerName || 'Walk-in'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Check Items Being Returned:
                </p>
                <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                  {selectedInvoice.items.map(item => {
                    const retState = returnItemsState[item.productId] || { selected: false, qty: 1 };
                    return (
                      <div
                        key={item.productId}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          retState.selected
                            ? 'bg-slate-800/90 border-emerald-500/50'
                            : 'bg-slate-900/60 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={retState.selected}
                            onChange={() => toggleItemSelection(item.productId)}
                            className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-slate-700 bg-slate-950 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Rate: ₹{item.price} • Billed Qty: {item.qty} {item.unit || 'pcs'}
                            </p>
                          </div>
                        </div>

                        {retState.selected && (
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-700">
                              <button
                                type="button"
                                onClick={() => updateItemQty(item.productId, -1)}
                                disabled={retState.qty <= 1}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-40"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono font-bold text-xs px-2 text-white">
                                {retState.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateItemQty(item.productId, 1)}
                                disabled={retState.qty >= item.qty}
                                className="p-1 text-slate-400 hover:text-white disabled:opacity-40"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <p className="font-mono font-bold text-xs text-rose-400 min-w-[65px] text-right">
                              ₹{(item.price * retState.qty).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Refund Banner */}
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated Refund Amount:</span>
                  <p className="text-xl font-bold font-mono text-rose-400">
                    ₹{totalRefundAmount.toFixed(2)}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>{selectedItemsToReturn.length} item(s) selected</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Back to Invoices
                </button>
                <button
                  type="button"
                  disabled={selectedItemsToReturn.length === 0}
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
                >
                  <span>Continue to Refund Mode</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Refund Method & Reason */}
          {step === 3 && (
            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Refund Payout Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Cash', label: 'Cash Refund', icon: Banknote },
                    { id: 'UPI', label: 'UPI / Direct', icon: QrCode },
                    { id: 'Adjust', label: 'Khata / Credit', icon: CreditCard }
                  ].map(m => {
                    const Icon = m.icon;
                    const isSelected = refundMode === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setRefundMode(m.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/50 shadow-sm'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Reason for Return
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {presetReasons.map(r => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setReturnReason(r)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        returnReason === r
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <textarea
                  rows="2"
                  value={customReasonNote}
                  onChange={(e) => setCustomReasonNote(e.target.value)}
                  placeholder="Optional customer feedback or return inspection notes..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                />
              </div>

              {/* Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Original Invoice:</span>
                  <span className="font-mono text-slate-200">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Items Restocking:</span>
                  <span className="text-slate-200 font-semibold">{selectedItemsToReturn.length} SKU(s)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Refund Method:</span>
                  <span className="text-slate-200 font-semibold">{refundMode}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-700 text-sm font-bold">
                  <span className="text-slate-200">Total Refund Payable:</span>
                  <span className="font-mono text-rose-400 text-base">₹{totalRefundAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-rose-500/20 flex items-center gap-1.5 transition-all"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Confirm Return &amp; Restock</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && completedReturn && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">Return Processed Successfully!</h4>
                <p className="text-xs text-slate-400">
                  Inventory has been automatically restocked to current store counter.
                </p>
              </div>

              <div className="max-w-xs mx-auto p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Return Slip #:</span>
                  <span className="font-mono font-bold text-emerald-400">{completedReturn.returnNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Original Invoice:</span>
                  <span className="font-mono text-slate-300">{completedReturn.originalInvoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Refund Amount:</span>
                  <span className="font-mono font-bold text-rose-400 text-sm">
                    ₹{completedReturn.refundAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mode:</span>
                  <span className="text-slate-300 font-semibold">{completedReturn.refundMode}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedInvoice(null);
                    setCompletedReturn(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Process Another Return
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
