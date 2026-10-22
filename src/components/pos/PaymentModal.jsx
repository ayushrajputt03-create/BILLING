import React, { useState } from 'react';
import { 
  CreditCard, 
  Banknote, 
  QrCode, 
  UserCheck, 
  X, 
  Tag, 
  Printer, 
  ArrowRight,
  User,
  Phone
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

export const PaymentModal = ({ isOpen, onClose, cartItems, grandTotal, onCompleteCheckout }) => {
  const { currentTenant, customers } = useTenant();

  const [paymentMode, setPaymentMode] = useState('Cash');
  const [billDiscount, setBillDiscount] = useState(0);
  const [cashTendered, setCashTendered] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shouldPrintReceipt, setShouldPrintReceipt] = useState(true);

  if (!isOpen) return null;

  const netGrandTotal = Math.max(0, grandTotal - billDiscount);
  const cashAmount = parseFloat(cashTendered) || 0;
  const changeAmount = Math.max(0, cashAmount - netGrandTotal);

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    if (paymentMode === 'Cash' && cashAmount < netGrandTotal && cashAmount > 0) {
      if (!confirm(`Cash tendered (₹${cashAmount}) is less than total amount (₹${netGrandTotal.toFixed(2)}). Continue?`)) {
        return;
      }
    }

    if (paymentMode === 'Udhaar' && !customerPhone.trim() && !customerName.trim()) {
      alert('Please enter Customer Name and Mobile Number to record this sale under Khata / Store Credit.');
      return;
    }

    onCompleteCheckout({
      mode: paymentMode,
      paymentMode,
      billDiscount: Number(billDiscount),
      customerInfo: { name: customerName || 'Walk-in Customer', phone: customerPhone },
      shouldPrint: shouldPrintReceipt,
      cashTendered: cashAmount,
      changeReturned: changeAmount
    });
  };

  const setQuickCash = (amt) => {
    setCashTendered(amt.toString());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Collect Payment & Checkout</h3>
              <p className="text-[11px] text-slate-400">{cartItems.length} item(s) • Total Amount: ₹{netGrandTotal.toFixed(2)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitPayment} className="p-5 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Payment Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Cash', label: 'Cash', icon: Banknote },
                { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                { id: 'Card', label: 'Card / POS', icon: CreditCard },
                { id: 'Udhaar', label: 'Store Credit', icon: UserCheck }
              ].map(m => {
                const Icon = m.icon;
                const isSelected = paymentMode === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMode(m.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {paymentMode === 'Cash' && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Cash Received from Customer</label>
                <div className="flex gap-1">
                  {[netGrandTotal, 100, 200, 500, 2000].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setQuickCash(Math.ceil(val))}
                      className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-mono text-slate-200"
                    >
                      {val === netGrandTotal ? 'Exact' : `₹${val}`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="1"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder={`₹${Math.ceil(netGrandTotal)}`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-lg focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>
              {cashAmount > 0 && (
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <span className="text-emerald-400 font-medium">Change to return customer:</span>
                  <span className="font-mono font-bold text-emerald-300 text-base">₹{changeAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {paymentMode === 'UPI' && (
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-white rounded-xl shadow-lg">
                <div className="w-36 h-36 bg-slate-900 rounded flex items-center justify-center p-2 text-white font-mono text-[9px] text-center">
                  <div className="space-y-1">
                    <QrCode className="w-16 h-16 mx-auto text-emerald-400" />
                    <p className="text-[10px] text-slate-300 font-sans font-bold">{currentTenant.name}</p>
                    <p className="text-[9px] text-emerald-400">Scan via GPay / PhonePe / Paytm</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-300 font-semibold">Instant UPI Payment QR</p>
              <p className="text-[11px] text-slate-400">Ask customer to scan QR code on counter screen for ₹{netGrandTotal.toFixed(2)}</p>
            </div>
          )}

          {paymentMode === 'Udhaar' && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Store Credit / Khata Transaction</span>
              </p>
              <p className="text-[11px] text-slate-300">
                This bill amount of ₹{netGrandTotal.toFixed(2)} will be debited to customer's outstanding Khata balance.
              </p>
            </div>
          )}

          <div className="space-y-3 pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Customer Details {paymentMode === 'Udhaar' ? '(Required for Khata)' : '(Optional)'}
              </p>
            </div>

            {/* Quick Pick from existing customers if available */}
            {customers && customers.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[10px] text-slate-500 shrink-0">Quick Select:</span>
                {customers.slice(0, 5).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCustomerName(c.name);
                      setCustomerPhone(c.phone);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold whitespace-nowrap border border-slate-700/60"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Mobile No (+91...)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">Bill Level Discount</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 font-mono">₹</span>
              <input
                type="number"
                min="0"
                value={billDiscount || ''}
                onChange={(e) => setBillDiscount(Number(e.target.value))}
                placeholder="0"
                className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 text-right"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={shouldPrintReceipt}
                onChange={(e) => setShouldPrintReceipt(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-950"
              />
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Auto Print Thermal Receipt after Checkout</span>
            </label>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Final Payable</p>
              <p className="text-2xl font-bold font-mono text-emerald-400">₹{netGrandTotal.toFixed(2)}</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
            >
              <span>Complete Sale</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
