import React, { useState, useEffect, useRef } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Scan, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  Camera, 
  CreditCard 
} from 'lucide-react';
import { CameraScannerModal } from './CameraScannerModal';
import { PaymentModal } from './PaymentModal';
import { ThermalPrintModal } from './ThermalPrintModal';

export const POSBillingTerminal = () => {
  const { products, activeBranch, createInvoice } = useTenant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const barcodeBufferRef = useRef('');
  const lastKeyTimeRef = useRef(Date.now());
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBufferRef.current.length >= 3) {
          const barcode = barcodeBufferRef.current.trim();
          barcodeBufferRef.current = '';
          handleScanBarcode(barcode);
          if (isInput) e.preventDefault();
        }
        return;
      }

      if (e.key.length === 1) {
        if (timeDiff > 100) {
          barcodeBufferRef.current = e.key;
        } else {
          barcodeBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  useEffect(() => {
    const handleShortcuts = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setCart([]);
        if (searchInputRef.current) searchInputRef.current.focus();
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) setIsPaymentOpen(true);
      } else if (e.key === 'Escape') {
        setIsCameraOpen(false);
        setIsPaymentOpen(false);
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [cart]);

  const handleScanBarcode = (barcode) => {
    const match = products.find(p => p.barcode === barcode || p.name.toLowerCase() === barcode.toLowerCase());
    if (match) {
      addToCart(match);
      setSearchQuery('');
    } else {
      alert(`Product with barcode "${barcode}" not found in current catalog.`);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += 1;
        return updated;
      } else {
        return [...prev, { ...product, qty: 1, discount: 0 }];
      }
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.barcode.includes(searchQuery) ||
                          (p.hsnCode && p.hsnCode.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  let subtotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;

  cart.forEach(item => {
    const lineTotal = item.sellingPrice * item.qty - (item.discount || 0);
    subtotal += lineTotal;
    const taxRate = item.taxRate || 0;
    const taxAmt = (lineTotal * taxRate) / 100;
    cgstTotal += taxAmt / 2;
    sgstTotal += taxAmt / 2;
  });

  const grandTotal = Math.round((subtotal + cgstTotal + sgstTotal) * 100) / 100;

  const handleCheckoutComplete = (paymentData) => {
    const newInv = createInvoice(cart, paymentData, paymentData.customerInfo, paymentData.billDiscount);
    setCart([]);
    setIsPaymentOpen(false);
    setCompletedInvoice(newInv);
    if (paymentData.shouldPrint) {
      setIsPrintOpen(true);
    }
  };

  return (
    <div className="pos-terminal flex-1 p-3 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
        <div className="glass-card p-3 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Scan barcode or type Product / HSN / Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handleScanBarcode(searchQuery.trim());
                }
              }}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsCameraOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Camera Scan</span>
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[calc(100vh-250px)]">
          {filteredProducts.map(p => {
            const branchStock = p.stocks?.[activeBranch.id] ?? 0;
            const isLowStock = branchStock <= p.minStockAlert;
            return (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="glass-card p-3 text-left hover:border-emerald-500/50 hover:bg-slate-800/90 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      {p.category}
                    </span>
                    <span className={`text-[10px] font-mono font-semibold ${isLowStock ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-400'}`}>
                      {branchStock} {p.unit}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-xs line-clamp-2 group-hover:text-emerald-300 transition-colors">
                    {p.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Barcode: {p.barcode}</p>
                </div>

                <div className="flex items-end justify-between mt-3 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 line-through mr-1">₹{p.mrp}</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">₹{p.sellingPrice}</span>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-5 glass-card p-4 flex flex-col justify-between border-slate-800">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base font-display">Current Bill Items</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                {cart.length}
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Bill</span>
              </button>
            )}
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[42vh] pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Scan className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                <p className="text-xs font-semibold text-slate-400">Ready for Barcode Scanning</p>
                <p className="text-[11px]">Plug in USB HID scanner or tap products to bill</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/70 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-slate-100 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>₹{item.sellingPrice} / {item.unit}</span>
                      <span>• GST {item.taxRate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-700">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="p-1 text-slate-400 hover:text-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-xs px-2 text-white">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="p-1 text-slate-400 hover:text-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <p className="font-bold font-mono text-xs text-emerald-400">
                      ₹{(item.sellingPrice * item.qty - (item.discount || 0)).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-300 font-medium">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal:</span>
              <span className="font-mono">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>CGST (2.5% - 9%):</span>
              <span className="font-mono">₹{cgstTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>SGST (2.5% - 9%):</span>
              <span className="font-mono">₹{sgstTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
              <span>Grand Total (Incl. GST):</span>
              <span className="font-mono text-xl text-emerald-400">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <CreditCard className="w-5 h-5" />
            <span>COLLECT PAYMENT (F8)</span>
          </button>
        </div>
      </div>

      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={handleScanBarcode}
        availableProducts={products}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        cartItems={cart}
        subtotal={subtotal}
        cgstTotal={cgstTotal}
        sgstTotal={sgstTotal}
        grandTotal={grandTotal}
        onCompleteCheckout={handleCheckoutComplete}
      />

      <ThermalPrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        invoice={completedInvoice}
      />
    </div>
  );
};
