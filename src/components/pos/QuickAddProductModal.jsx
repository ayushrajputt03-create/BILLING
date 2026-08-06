import React, { useState, useEffect } from 'react';
import { Plus, X, Tag, PackagePlus, AlertCircle } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

export const QuickAddProductModal = ({ isOpen, onClose, barcode, onProductCreatedAndAdded }) => {
  const { addProduct } = useTenant();

  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [category, setCategory] = useState('Groceries & Oil');
  const [hsnCode, setHsnCode] = useState('9999');
  const [taxRate, setTaxRate] = useState(5);
  const [unit, setUnit] = useState('pcs');
  const [initialStock, setInitialStock] = useState(50);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setSellingPrice('');
      setMrp('');
    }
  }, [isOpen, barcode]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !sellingPrice) {
      alert('Product Name and Selling Price are required!');
      return;
    }

    const priceNum = Number(sellingPrice);
    const mrpNum = mrp ? Number(mrp) : priceNum;

    const newProd = addProduct({
      barcode: barcode || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      name: name.trim(),
      category,
      hsnCode,
      taxRate: Number(taxRate),
      unit,
      costPrice: Math.round(priceNum * 0.8 * 100) / 100, // Default cost price estimate
      mrp: mrpNum,
      sellingPrice: priceNum,
      minStockAlert: 10,
      initialStock: Number(initialStock || 50)
    });

    onProductCreatedAndAdded(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">New Product Detected</h3>
              <p className="text-[11px] font-mono text-emerald-400">Barcode: {barcode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Barcode <strong>{barcode}</strong> is not in your catalog. Quick-add it below to bill immediately!</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Coca Cola 750ml / Kurkure Masala"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Price (₹) *</label>
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">MRP (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="40.00"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Groceries & Oil">Groceries & Oil</option>
                  <option value="Dairy & Refrigerated">Dairy & Refrigerated</option>
                  <option value="Staples & Spices">Staples & Spices</option>
                  <option value="Snacks & Packaged Food">Snacks & Packaged Food</option>
                  <option value="Beverages & Drinks">Beverages & Drinks</option>
                  <option value="Household & Cleaning">Household & Cleaning</option>
                  <option value="Electronics & Hardware">Electronics & Hardware</option>
                  <option value="Fresh Produce">Fresh Produce</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">GST Tax Rate (%)</label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5% GST</option>
                  <option value={12}>12% GST</option>
                  <option value={18}>18% GST</option>
                  <option value={28}>28% GST</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save & Add to Bill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
