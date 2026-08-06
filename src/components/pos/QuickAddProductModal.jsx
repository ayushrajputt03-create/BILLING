import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, PackagePlus, Zap } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

export const QuickAddProductModal = ({ isOpen, onClose, barcode, onProductCreatedAndAdded }) => {
  const { addProduct } = useTenant();

  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [taxRate, setTaxRate] = useState(5);
  const [category, setCategory] = useState('General');

  const nameRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setSellingPrice('');
      setMrp('');
      setTaxRate(5);
      setCategory('General');
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen, barcode]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !sellingPrice) {
      alert('Product Name aur Selling Price zaroori hai!');
      return;
    }

    const priceNum = Number(sellingPrice);
    const mrpNum = mrp ? Number(mrp) : priceNum;

    // Stock 9999 set karo — koi bhi barcode scan ho, seedha bill me aaye
    const newProd = addProduct({
      barcode: barcode || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      name: name.trim(),
      category,
      hsnCode: '9999',
      taxRate: Number(taxRate),
      unit: 'pcs',
      costPrice: Math.round(priceNum * 0.8 * 100) / 100,
      mrp: mrpNum,
      sellingPrice: priceNum,
      minStockAlert: 0,
      initialStock: 9999 // Unlimited stock — no pre-update needed
    });

    onProductCreatedAndAdded(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-gradient-to-r from-emerald-900/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">New Product Scanned!</h3>
              <p className="text-[11px] font-mono text-emerald-400">Barcode: <span className="font-bold">{barcode}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
          <Zap className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>Yeh barcode catalog me nahi hai. Sirf <strong>naam</strong> aur <strong>price</strong> bharo — stock pre-update ki zaroorat nahi, seedha bill me add ho jayega!</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Product Name — Biggest Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Product Name *</label>
            <input
              ref={nameRef}
              type="text"
              required
              placeholder="e.g. Coca Cola 750ml / Maggi 70g / Kurkure"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none placeholder-slate-500"
            />
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Selling Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="40.00"
                value={sellingPrice}
                onChange={(e) => {
                  setSellingPrice(e.target.value);
                  if (!mrp) setMrp(e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">MRP (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="40.00"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Category & GST Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="General">General</option>
                <option value="Groceries & Oil">Groceries & Oil</option>
                <option value="Dairy & Refrigerated">Dairy & Refrigerated</option>
                <option value="Snacks & Packaged Food">Snacks & Packaged Food</option>
                <option value="Beverages & Drinks">Beverages & Drinks</option>
                <option value="Household & Cleaning">Household & Cleaning</option>
                <option value="Electronics & Hardware">Electronics</option>
                <option value="Staples & Spices">Staples & Spices</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">GST Rate</label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={18}>18% GST</option>
                <option value={28}>28% GST</option>
              </select>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Bill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
