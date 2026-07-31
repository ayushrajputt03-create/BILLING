import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  TrendingUp, 
  Receipt, 
  PieChart, 
  Printer, 
  CreditCard, 
  Banknote, 
  QrCode, 
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { ThermalPrintModal } from '../pos/ThermalPrintModal';

export const ReportsDashboard = () => {
  const { invoices } = useTenant();

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  let totalRevenue = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalDiscounts = 0;

  const modeTotals = { Cash: 0, UPI: 0, Card: 0, Udhaar: 0 };

  invoices.forEach(inv => {
    totalRevenue += inv.grandTotal;
    totalCgst += inv.cgstTotal;
    totalSgst += inv.sgstTotal;
    totalDiscounts += inv.discountTotal;

    if (modeTotals[inv.paymentMode] !== undefined) {
      modeTotals[inv.paymentMode] += inv.grandTotal;
    }
  });

  const hsnMap = {};
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      const hsn = item.hsnCode || '9999';
      if (!hsnMap[hsn]) {
        hsnMap[hsn] = {
          hsnCode: hsn,
          qty: 0,
          taxableValue: 0,
          cgst: 0,
          sgst: 0,
          taxRate: item.taxRate || 0
        };
      }
      hsnMap[hsn].qty += item.qty;
      hsnMap[hsn].taxableValue += item.lineTotal;
      const taxAmount = (item.lineTotal * item.taxRate) / 100;
      hsnMap[hsn].cgst += taxAmount / 2;
      hsnMap[hsn].sgst += taxAmount / 2;
    });
  });

  const hsnList = Object.values(hsnMap);

  const handleReprint = (inv) => {
    setSelectedInvoice(inv);
    setIsPrintOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">GST & Financial Analytics</h2>
          <p className="text-xs text-slate-400">GSTR-1 tax summary reports, sales breakdown & invoice reprint registry</p>
        </div>

        <button
          onClick={() => alert('Exporting GSTR-1 Tax Summary CSV for filing...')}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export GSTR-1 Filing Summary</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 space-y-2 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Gross Sales Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white">₹{totalRevenue.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">{invoices.length} Tax Invoices Generated</p>
        </div>

        <div className="glass-card p-4 space-y-2 border-sky-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Total GST Tax Collected</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white">₹{(totalCgst + totalSgst).toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">CGST: ₹{totalCgst.toFixed(2)} | SGST: ₹{totalSgst.toFixed(2)}</p>
        </div>

        <div className="glass-card p-4 space-y-2 border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Discounts Issued</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white">₹{totalDiscounts.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">Promotions & Bill Discounts</p>
        </div>

        <div className="glass-card p-4 space-y-2 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">UPI & Digital Payment Ratio</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {totalRevenue > 0 ? Math.round(((modeTotals.UPI + modeTotals.Card) / totalRevenue) * 100) : 0}%
          </p>
          <p className="text-[10px] text-slate-400">Cashless Billing Share</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4 space-y-3 border-slate-800">
          <h3 className="font-bold text-white text-sm">Payment Collection Breakdown</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center gap-3">
              <Banknote className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Cash Payments</p>
                <p className="text-base font-bold font-mono text-white">₹{modeTotals.Cash.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center gap-3">
              <QrCode className="w-6 h-6 text-sky-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">UPI / QR Code</p>
                <p className="text-base font-bold font-mono text-white">₹{modeTotals.UPI.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Card Payments</p>
                <p className="text-base font-bold font-mono text-white">₹{modeTotals.Card.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-amber-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Store Credit (Khata)</p>
                <p className="text-base font-bold font-mono text-white">₹{modeTotals.Udhaar.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 space-y-3 border-slate-800">
          <h3 className="font-bold text-white text-sm">GSTR-1 HSN-Wise Tax Summary Table</h3>
          <div className="overflow-x-auto max-h-48">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 font-bold uppercase text-[9px] border-b border-slate-700">
                <tr>
                  <th className="p-2">HSN</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Taxable Val</th>
                  <th className="p-2 text-right">CGST</th>
                  <th className="p-2 text-right">SGST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {hsnList.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="p-2 font-mono text-emerald-400 font-bold">{h.hsnCode}</td>
                    <td className="p-2 text-center font-mono">{h.qty}</td>
                    <td className="p-2 text-right font-mono">₹{h.taxableValue.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono text-sky-400">₹{h.cgst.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono text-sky-400">₹{h.sgst.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider text-slate-300">
          Recent Invoices & Bills History
        </h3>

        <div className="glass-card overflow-hidden border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3 text-right">Grand Total</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-emerald-400">{inv.invoiceNumber}</td>
                  <td className="p-3 text-slate-400">{new Date(inv.timestamp).toLocaleString('en-IN')}</td>
                  <td className="p-3 font-semibold text-white">{inv.customerName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {inv.paymentMode}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">₹{inv.grandTotal.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleReprint(inv)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-semibold flex items-center gap-1 ml-auto"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reprint</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ThermalPrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};
