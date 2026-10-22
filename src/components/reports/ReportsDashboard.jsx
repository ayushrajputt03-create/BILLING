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
  FileSpreadsheet,
  RotateCcw,
  Calendar,
  Filter,
  CheckCircle2,
  PackageX
} from 'lucide-react';
import { ThermalPrintModal } from '../pos/ThermalPrintModal';

export const ReportsDashboard = () => {
  const { invoices, returns } = useTenant();

  const [dateRange, setDateRange] = useState('all'); // 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'returns'

  // Helper date matching functions
  const isSameDay = (d1, d2) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const checkDateFilter = (timestamp) => {
    if (!timestamp) return false;
    if (dateRange === 'all') return true;

    const itemDate = new Date(timestamp);
    const now = new Date();

    if (dateRange === 'today') {
      return isSameDay(itemDate, now);
    }
    if (dateRange === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return isSameDay(itemDate, yesterday);
    }
    if (dateRange === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate >= weekAgo && itemDate <= now;
    }
    if (dateRange === 'month') {
      return itemDate.getFullYear() === now.getFullYear() && itemDate.getMonth() === now.getMonth();
    }
    if (dateRange === 'custom') {
      const itemIsoDate = itemDate.toISOString().split('T')[0];
      if (customStartDate && itemIsoDate < customStartDate) return false;
      if (customEndDate && itemIsoDate > customEndDate) return false;
      return true;
    }
    return true;
  };

  // Filtered datasets based on selected date filter
  const filteredInvoices = invoices.filter(inv => checkDateFilter(inv.timestamp));
  const filteredReturns = (returns || []).filter(ret => checkDateFilter(ret.timestamp));

  // Calculations for filtered invoices
  let totalRevenue = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalDiscounts = 0;

  const modeTotals = { Cash: 0, UPI: 0, Card: 0, Udhaar: 0 };

  filteredInvoices.forEach(inv => {
    totalRevenue += inv.grandTotal;
    totalCgst += inv.cgstTotal;
    totalSgst += inv.sgstTotal;
    totalDiscounts += (inv.discountTotal || 0);

    if (modeTotals[inv.paymentMode] !== undefined) {
      modeTotals[inv.paymentMode] += inv.grandTotal;
    }
  });

  // HSN Breakdown
  const hsnMap = {};
  filteredInvoices.forEach(inv => {
    (inv.items || []).forEach(item => {
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
      hsnMap[hsn].taxableValue += (item.lineTotal || (item.price * item.qty));
      const taxAmount = ((item.lineTotal || (item.price * item.qty)) * (item.taxRate || 0)) / 100;
      hsnMap[hsn].cgst += taxAmount / 2;
      hsnMap[hsn].sgst += taxAmount / 2;
    });
  });

  const hsnList = Object.values(hsnMap);

  // Returns calculations
  const totalRefundAmount = filteredReturns.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
  const totalReturnsCount = filteredReturns.length;

  const handleReprint = (inv) => {
    setSelectedInvoice(inv);
    setIsPrintOpen(true);
  };

  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      alert('No invoices available for the selected period to export.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Invoice Number,Date,Customer,Phone,Payment Mode,Subtotal,Discount,CGST,SGST,Grand Total\n";

    filteredInvoices.forEach(inv => {
      const row = [
        `"${inv.invoiceNumber}"`,
        `"${new Date(inv.timestamp).toLocaleString('en-IN')}"`,
        `"${inv.customerName || 'Walk-in'}"`,
        `"${inv.customerPhone || ''}"`,
        `"${inv.paymentMode}"`,
        inv.subtotal?.toFixed(2) || '0.00',
        inv.discountTotal?.toFixed(2) || '0.00',
        inv.cgstTotal?.toFixed(2) || '0.00',
        inv.sgstTotal?.toFixed(2) || '0.00',
        inv.grandTotal?.toFixed(2) || '0.00'
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSTR1_Sales_Report_${dateRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3 sm:p-5 md:p-6 space-y-5">
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">GST &amp; Financial Analytics</h2>
          <p className="text-xs text-slate-400">
            GSTR-1 tax summaries, sales &amp; returns audit, payment mode breakdowns &amp; reprint registry
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export GSTR-1 CSV</span>
        </button>
      </div>

      {/* Date Range Filter Bar */}
      <div className="glass-card p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Date Range Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'custom', label: 'Custom Range' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setDateRange(btn.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                dateRange === btn.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {dateRange === 'custom' && (
          <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <span className="text-xs text-slate-500">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        )}
      </div>

      {/* KPI Stats Cards - 5 Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="glass-card p-3.5 space-y-1.5 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Gross Sales Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white">₹{totalRevenue.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">{filteredInvoices.length} Invoices Generated</p>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-sky-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Total GST Tax</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white">₹{(totalCgst + totalSgst).toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">CGST + SGST Combined</p>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Discounts Issued</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <PieChart className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white">₹{totalDiscounts.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">Promotions &amp; Concessions</p>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-rose-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Returns &amp; Refunds</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-rose-400">₹{totalRefundAmount.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">{totalReturnsCount} Return Slip(s) Processed</p>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-amber-500/20 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Digital Billing Ratio</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <QrCode className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white">
            {totalRevenue > 0 ? Math.round(((modeTotals.UPI + modeTotals.Card) / totalRevenue) * 100) : 0}%
          </p>
          <p className="text-[10px] text-slate-400">UPI &amp; Card Transactions</p>
        </div>
      </div>

      {/* Payment Modes & HSN Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Collection Breakdown */}
        <div className="glass-card p-4 space-y-3 border-slate-800">
          <h3 className="font-bold text-white text-sm">Payment Collection Breakdown</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center gap-3">
              <Banknote className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Cash</p>
                <p className="text-base font-bold font-mono text-white">₹{modeTotals.Cash.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center gap-3">
              <QrCode className="w-6 h-6 text-sky-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">UPI / QR</p>
                <p className="text-base font-bold font-mono text-white">₹{modeTotals.UPI.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-purple-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Card</p>
                <p className="text-base font-bold font-mono text-white">₹{modeTotals.Card.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Udhaar (Khata)</p>
                <p className="text-base font-bold font-mono text-white">₹{modeTotals.Udhaar.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* HSN-Wise Summary Table */}
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
                {hsnList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-slate-500">
                      No transactions found for selected period
                    </td>
                  </tr>
                ) : (
                  hsnList.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-2 font-mono text-emerald-400 font-bold">{h.hsnCode}</td>
                      <td className="p-2 text-center font-mono">{h.qty}</td>
                      <td className="p-2 text-right font-mono">₹{h.taxableValue.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono text-sky-400">₹{h.cgst.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono text-sky-400">₹{h.sgst.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoices vs Returns Registry Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'invoices'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tax Invoices History ({filteredInvoices.length})
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'returns'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Returns &amp; Refunds Registry ({filteredReturns.length})
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Filter: {dateRange.toUpperCase()}</span>
        </div>

        {/* Invoices Table */}
        {activeTab === 'invoices' && (
          <div className="glass-card overflow-hidden border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Date &amp; Time</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3 text-right">Grand Total</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      No invoices recorded for this time range
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-emerald-400">{inv.invoiceNumber}</td>
                      <td className="p-3 text-slate-400">{new Date(inv.timestamp).toLocaleString('en-IN')}</td>
                      <td className="p-3 font-semibold text-white">{inv.customerName || 'Walk-in'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.paymentMode === 'Udhaar'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {inv.paymentMode}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        ₹{inv.grandTotal.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleReprint(inv)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Reprint</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Returns Table */}
        {activeTab === 'returns' && (
          <div className="glass-card overflow-hidden border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Return Slip #</th>
                  <th className="p-3">Original Invoice</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Refund Mode</th>
                  <th className="p-3 text-right">Refund Amount</th>
                  <th className="p-3 text-right">Restocked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">
                      No returns recorded for this period
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map(ret => (
                    <tr key={ret.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-rose-400">{ret.returnNumber}</td>
                      <td className="p-3 font-mono text-slate-300">{ret.originalInvoiceNumber}</td>
                      <td className="p-3 text-slate-200 font-semibold">{ret.customerName || 'Walk-in'}</td>
                      <td className="p-3 text-slate-400">{ret.reason}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {ret.refundMode}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400">
                        ₹{(ret.refundAmount || 0).toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-slate-400 text-[11px]">
                        {ret.processedBy || 'Store Cashier'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ThermalPrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
};
