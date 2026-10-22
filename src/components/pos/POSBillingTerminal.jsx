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
  CreditCard,
  ArrowRight,
  Sparkles,
  ChevronUp,
  X,
  Printer,
  CheckCircle2,
  RotateCcw,
  Eye,
  Check
} from 'lucide-react';
import { CameraScannerModal } from './CameraScannerModal';
import { PaymentModal } from './PaymentModal';
import { ThermalPrintModal } from './ThermalPrintModal';
import { QuickAddProductModal } from './QuickAddProductModal';
import { ReturnModal } from './ReturnModal';

export const POSBillingTerminal = () => {
  const { products, activeBranch, createInvoice } = useTenant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);

  // Mobile View state ('catalog' vs 'cart') & Mobile Sheet Open State
  const [mobileTab, setMobileTab] = useState('catalog'); // 'catalog' | 'cart'
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Quick Add Unknown Barcode Modal
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [unknownBarcode, setUnknownBarcode] = useState('');

  const barcodeBufferRef = useRef('');
  const lastKeyTimeRef = useRef(Date.now());
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current && window.innerWidth > 768) {
      searchInputRef.current.focus();
    }
  }, []);

  // HID Scanner Global Listener
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

  // Keyboard Shortcuts (F2, F8, Esc)
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
        setIsQuickAddOpen(false);
        setIsMobileCartOpen(false);
        setIsReturnOpen(false);
        setIsSuccessModalOpen(false);
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
      setUnknownBarcode(barcode);
      setIsQuickAddOpen(true);
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

  const handleProductCreatedAndAdded = (newProduct) => {
    addToCart(newProduct);
    setSearchQuery('');
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

  const updateItemDiscount = (id, val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, discount: num };
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
  const totalItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckoutComplete = (paymentData) => {
    const newInv = createInvoice(cart, paymentData, paymentData.customerInfo, paymentData.billDiscount);
    setCart([]);
    setIsPaymentOpen(false);
    setIsMobileCartOpen(false);
    setCompletedInvoice(newInv);
    setIsSuccessModalOpen(true);
    if (paymentData.shouldPrint) {
      setIsPrintOpen(true);
    }
  };

  return (
    <div className="pos-terminal flex-1 p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 pb-20 md:pb-4">
      {/* LEFT PANEL: Search & Product Quick Pick Grid (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col gap-3 min-h-0">
        {/* Search Bar & Barcode Scanner Triggers */}
        <div className="glass-card p-2.5 sm:p-3 flex flex-col sm:flex-row items-center gap-2">
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
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-medium placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsReturnOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Process a Return or Refund"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Sales Return</span>
            </button>

            <button
              onClick={() => setIsCameraOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-emerald-500/10"
            >
              <Camera className="w-4 h-4 animate-pulse" />
              <span>Camera Scanner</span>
            </button>
          </div>
        </div>

        {/* Category Horizontal Scrolling Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Quick Pick Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[calc(100vh-230px)]">
          {filteredProducts.map(p => {
            const branchStock = p.stocks?.[activeBranch.id] ?? 0;
            const isLowStock = branchStock <= p.minStockAlert;
            return (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="glass-card p-3 text-left hover:border-emerald-500/50 hover:bg-slate-800/90 transition-all flex flex-col justify-between group relative overflow-hidden active:scale-95"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-lg border border-emerald-500/20 truncate max-w-[90px]">
                      {p.category}
                    </span>
                    <span className={`text-[9px] font-mono font-semibold ${isLowStock ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-400'}`}>
                      {branchStock} {p.unit}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-xs sm:text-xs line-clamp-2 group-hover:text-emerald-300 transition-colors leading-snug">
                    {p.name}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-mono mt-1">Barcode: {p.barcode}</p>
                </div>

                <div className="flex items-end justify-between mt-2.5 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] sm:text-xs text-slate-400 line-through mr-1">₹{p.mrp}</span>
                    <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400">₹{p.sellingPrice}</span>
                  </div>
                  <div className="w-6 h-6 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-slate-950 flex items-center justify-center transition-colors shadow-sm">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: High Contrast Billing Cart (Desktop: 5 Cols / Mobile Drawer) */}
      <div className="hidden lg:flex lg:col-span-5 glass-card p-4 flex-col justify-between border-slate-800">
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

                    {/* Item Level Discount Input */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Disc: ₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.discount || ''}
                        onChange={(e) => updateItemDiscount(item.id, e.target.value)}
                        placeholder="0 off"
                        title="Item-level discount in ₹"
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-white font-mono text-right focus:outline-none focus:border-emerald-500"
                      />
                      {item.discount > 0 && (
                        <span className="text-[9px] text-rose-400 font-mono">
                          (-₹{Number(item.discount).toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-700 shrink-0">
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

                  <div className="text-right min-w-[75px] shrink-0">
                    {item.discount > 0 && (
                      <span className="text-[10px] text-slate-500 line-through block font-mono">
                        ₹{(item.sellingPrice * item.qty).toFixed(2)}
                      </span>
                    )}
                    <p className="font-bold font-mono text-xs text-emerald-400">
                      ₹{(item.sellingPrice * item.qty - (item.discount || 0)).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors mt-0.5"
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

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsReturnOpen(true)}
              className="px-3.5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              title="Process a Return or Refund"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span className="hidden xl:inline">Return</span>
            </button>

            <button
              disabled={cart.length === 0}
              onClick={() => setIsPaymentOpen(true)}
              className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <CreditCard className="w-5 h-5" />
              <span>COLLECT PAYMENT (F8)</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING CART SUMMARY BAR & SLIDE-UP DRAWER */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-14 left-3 right-3 z-40">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 p-3 rounded-2xl shadow-2xl flex items-center justify-between font-bold active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-slate-950/20 flex items-center justify-center text-slate-950 font-extrabold text-xs">
                {totalItemCount}
              </div>
              <div className="text-left">
                <p className="text-xs leading-none">View Cart Items</p>
                <p className="text-[10px] opacity-80 mt-0.5">{cart.length} unique SKU(s)</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold">₹{grandTotal.toFixed(2)}</span>
              <div className="px-2.5 py-1 rounded-xl bg-slate-950 text-emerald-400 text-xs font-bold flex items-center gap-1">
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* MOBILE CART SLIDE-UP DRAWER */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-4 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Current Cart Items ({cart.length})</h3>
              </div>
              <button onClick={() => setIsMobileCartOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">₹{item.sellingPrice} • GST {item.taxRate}%</p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-700 shrink-0">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1 text-slate-300">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-mono font-bold text-xs px-2 text-white">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1 text-slate-300">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right min-w-[65px] shrink-0">
                      {item.discount > 0 && (
                        <span className="text-[10px] text-slate-500 line-through block font-mono">
                          ₹{(item.sellingPrice * item.qty).toFixed(2)}
                        </span>
                      )}
                      <p className="font-bold font-mono text-xs text-emerald-400">
                        ₹{(item.sellingPrice * item.qty - (item.discount || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Discount: ₹</span>
                      <input
                        type="number"
                        min="0"
                        value={item.discount || ''}
                        onChange={(e) => updateItemDiscount(item.id, e.target.value)}
                        placeholder="0 off"
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-white font-mono text-right"
                      />
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-rose-400 hover:text-rose-300">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex justify-between text-base font-bold text-white">
                <span>Total Amount (Incl. GST):</span>
                <span className="font-mono text-xl text-emerald-400">₹{grandTotal.toFixed(2)}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileCartOpen(false);
                    setIsReturnOpen(true);
                  }}
                  className="px-3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1 shrink-0"
                >
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Return</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileCartOpen(false);
                    setIsPaymentOpen(true);
                  }}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-2xl text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>PROCEED TO PAYMENT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={handleScanBarcode}
        availableProducts={products}
      />

      <QuickAddProductModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        barcode={unknownBarcode}
        onProductCreatedAndAdded={handleProductCreatedAndAdded}
      />

      <ReturnModal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
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

      {/* Prominent Sale Completed Success Modal with Show & Print Options */}
      {isSuccessModalOpen && completedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-5 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-display">Sale Completed Successfully!</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tax invoice generated &amp; inventory deducted</p>
            </div>

            {/* Bill Info Card */}
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-2 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice Number:</span>
                <span className="font-mono font-bold text-emerald-400">{completedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-semibold text-slate-200">
                  {completedInvoice.customerName || 'Walk-in'} {completedInvoice.customerPhone && `(${completedInvoice.customerPhone})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-700">
                  {completedInvoice.paymentMode}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-700 text-sm font-bold">
                <span className="text-slate-200">Grand Total:</span>
                <span className="font-mono text-emerald-400 text-base">₹{completedInvoice.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Clear Primary Action Buttons: Show / View Invoice, Print Receipt, Start Next Bill */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintOpen(true)}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Show / View Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrintOpen(true)}
                  className="py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  if (searchInputRef.current) searchInputRef.current.focus();
                }}
                className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Start Next Bill (New Sale)
              </button>
            </div>
          </div>
        </div>
      )}

      <ThermalPrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        invoice={completedInvoice}
      />
    </div>
  );
};
