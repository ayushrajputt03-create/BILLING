import React, { useState } from 'react';
import { Printer, X } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

export const ThermalPrintModal = ({ isOpen, onClose, invoice }) => {
  const { currentTenant, activeBranch } = useTenant();
  const [printFormat, setPrintFormat] = useState('80mm');

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-slate-800/60 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-white text-base">Print Receipt Preview</h3>
              <p className="text-[11px] text-slate-400">Invoice #{invoice.invoiceNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setPrintFormat('80mm')}
                className={`px-2.5 py-1 rounded font-mono ${printFormat === '80mm' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400'}`}
              >
                80mm POS
              </button>
              <button
                onClick={() => setPrintFormat('58mm')}
                className={`px-2.5 py-1 rounded font-mono ${printFormat === '58mm' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400'}`}
              >
                58mm POS
              </button>
              <button
                onClick={() => setPrintFormat('A4')}
                className={`px-2.5 py-1 rounded font-mono ${printFormat === 'A4' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400'}`}
              >
                A4 GST Tax Invoice
              </button>
            </div>

            <button onClick={handlePrint} className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3">
              <Printer className="w-4 h-4" />
              <span>Print Now</span>
            </button>

            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 flex justify-center text-slate-900">
          <div className="printable-area">
            {printFormat === 'A4' ? (
              <div className="w-[190mm] bg-white p-8 font-sans text-xs text-black border border-slate-300 shadow-md">
                <div className="flex justify-between border-b-2 border-slate-900 pb-4 mb-4">
                  <div>
                    <h1 className="text-xl font-bold uppercase tracking-tight text-black">{currentTenant.name}</h1>
                    <p className="text-slate-700">{activeBranch.address}</p>
                    <p className="text-slate-700">Phone: {activeBranch.phone || currentTenant.ownerPhone}</p>
                    <p className="font-bold font-mono mt-1 text-slate-900">GSTIN: {currentTenant.gstin}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-base font-bold text-emerald-700 uppercase">TAX INVOICE</h2>
                    <p className="font-mono font-bold mt-1">Invoice #: {invoice.invoiceNumber}</p>
                    <p className="text-slate-600">Date: {new Date(invoice.timestamp).toLocaleDateString('en-IN')}</p>
                    <p className="text-slate-600">Time: {new Date(invoice.timestamp).toLocaleTimeString('en-IN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 border border-slate-200 rounded">
                  <div>
                    <p className="font-bold text-slate-700 uppercase text-[10px]">Billed To Customer:</p>
                    <p className="font-bold">{invoice.customerName}</p>
                    {invoice.customerPhone && <p className="text-slate-600">Ph: {invoice.customerPhone}</p>}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 uppercase text-[10px]">Payment Details:</p>
                    <p className="font-semibold">Mode: {invoice.paymentMode}</p>
                    <p className="text-slate-600">Status: {invoice.paymentStatus}</p>
                  </div>
                </div>

                <table className="w-full border-collapse mb-4 text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-2 text-left border">#</th>
                      <th className="p-2 text-left border">Item Description</th>
                      <th className="p-2 text-center border">HSN</th>
                      <th className="p-2 text-center border">Qty</th>
                      <th className="p-2 text-right border">Rate (₹)</th>
                      <th className="p-2 text-center border">GST %</th>
                      <th className="p-2 text-right border">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-300">
                        <td className="p-2 border">{idx + 1}</td>
                        <td className="p-2 border font-medium">{item.name}</td>
                        <td className="p-2 text-center border font-mono">{item.hsnCode}</td>
                        <td className="p-2 text-center border font-mono">{item.qty} {item.unit || ''}</td>
                        <td className="p-2 text-right border font-mono">{item.price.toFixed(2)}</td>
                        <td className="p-2 text-center border font-mono">{item.taxRate}%</td>
                        <td className="p-2 text-right border font-mono font-semibold">{item.lineTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between items-start pt-2">
                  <div className="w-1/2 text-[10px] space-y-1">
                    <p className="font-bold uppercase text-slate-700">GST Summary Breakdown:</p>
                    <p>CGST Total: ₹{invoice.cgstTotal.toFixed(2)}</p>
                    <p>SGST Total: ₹{invoice.sgstTotal.toFixed(2)}</p>
                    <p className="mt-3 text-slate-500 italic">Terms: Goods once sold will not be taken back without valid bill.</p>
                  </div>
                  <div className="w-5/12 space-y-1 font-mono text-right">
                    <div className="flex justify-between text-slate-700">
                      <span>Sub Total:</span>
                      <span>₹{invoice.subtotal.toFixed(2)}</span>
                    </div>
                    {invoice.discountTotal > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Discount:</span>
                        <span>-₹{invoice.discountTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-700">
                      <span>Total Tax (CGST+SGST):</span>
                      <span>₹{(invoice.cgstTotal + invoice.sgstTotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-black border-t-2 border-slate-900 pt-1 mt-1">
                      <span>Grand Total:</span>
                      <span>₹{invoice.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-[10px]">
                  <p>Cashier: {invoice.cashierName}</p>
                  <div className="text-center">
                    <div className="h-8 border-b border-slate-400 w-32 mb-1"></div>
                    <p className="font-bold">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`bg-white p-4 font-mono text-black border border-slate-300 shadow-xl ${printFormat === '58mm' ? 'thermal-receipt-58' : 'thermal-receipt'}`}>
                <div className="text-center space-y-1 border-b border-black pb-2 mb-2">
                  <h2 className="font-bold text-sm uppercase">{currentTenant.name}</h2>
                  <p className="text-[10px]">{activeBranch.address}</p>
                  <p className="text-[10px]">Ph: {activeBranch.phone || currentTenant.ownerPhone}</p>
                  <p className="text-[10px] font-bold">GSTIN: {currentTenant.gstin}</p>
                </div>

                <div className="text-[10px] border-b border-dashed border-black pb-2 mb-2 space-y-0.5">
                  <p><span className="font-bold">Bill No:</span> {invoice.invoiceNumber}</p>
                  <p><span className="font-bold">Date:</span> {new Date(invoice.timestamp).toLocaleString('en-IN')}</p>
                  <p><span className="font-bold">Customer:</span> {invoice.customerName}</p>
                </div>

                <div className="border-b border-black pb-2 mb-2 text-[10px]">
                  <div className="flex justify-between font-bold border-b border-slate-400 pb-1 mb-1">
                    <span>ITEM</span>
                    <span>QTY x RATE</span>
                    <span>AMT</span>
                  </div>
                  {invoice.items.map((item, i) => (
                    <div key={i} className="mb-1">
                      <p className="font-bold leading-tight">{item.name}</p>
                      <div className="flex justify-between text-slate-700">
                        <span>{item.hsnCode ? `[${item.hsnCode}]` : ''} {item.qty} x ₹{item.price}</span>
                        <span className="font-bold text-black">₹{item.lineTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] space-y-0.5 border-b border-black pb-2 mb-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.discountTotal > 0 && (
                    <div className="flex justify-between font-bold">
                      <span>Discount:</span>
                      <span>-₹{invoice.discountTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>CGST (Incl):</span>
                    <span>₹{invoice.cgstTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (Incl):</span>
                    <span>₹{invoice.sgstTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs border-t border-dashed border-black pt-1 mt-1">
                    <span>NET TOTAL:</span>
                    <span>₹{invoice.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-700 pt-1">
                    <span>Paid Via: {invoice.paymentMode}</span>
                    <span>Status: PAID</span>
                  </div>
                </div>

                <div className="text-center text-[9px] space-y-1">
                  <p className="font-bold">*** THANK YOU FOR SHOPPING! ***</p>
                  <p>Software Powered by RetailBill POS</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
