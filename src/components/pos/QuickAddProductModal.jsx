import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, PackagePlus, Zap, Loader2, CheckCircle2, WifiOff, Globe } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

// Auto-lookup from Open Food Facts + UPC Item DB (both free, no API key needed)
const lookupBarcodeOnline = async (barcode) => {
  // 1. Try Open Food Facts first (best for Indian FMCG & grocery products)
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      { signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    if (data.status === 1 && data.product) {
      const p = data.product;
      const name = [p.product_name, p.brands, p.quantity]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (name) {
        return {
          name,
          brand: p.brands || '',
          category: mapOFFCategory(p.categories_tags),
          mrp: 0,    // price not available in free API, user fills it
          source: 'Open Food Facts'
        };
      }
    }
  } catch (_) {}

  // 2. Try UPC Item DB (good for packaged goods)
  try {
    const res = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
      { signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    if (data.code === 'OK' && data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        name: item.title || item.brand || '',
        brand: item.brand || '',
        category: mapUPCCategory(item.category),
        mrp: item.highest_recorded_price ? Math.round(item.highest_recorded_price * 83) : 0, // USD to INR approx
        source: 'UPC Item DB'
      };
    }
  } catch (_) {}

  return null;
};

const mapOFFCategory = (categoriesTags) => {
  if (!categoriesTags) return 'General';
  const tags = categoriesTags.join(' ').toLowerCase();
  if (tags.includes('beverage') || tags.includes('drink') || tags.includes('juice') || tags.includes('water')) return 'Beverages & Drinks';
  if (tags.includes('dairy') || tags.includes('milk') || tags.includes('cheese') || tags.includes('yogurt')) return 'Dairy & Refrigerated';
  if (tags.includes('snack') || tags.includes('chip') || tags.includes('biscuit') || tags.includes('chocolate')) return 'Snacks & Packaged Food';
  if (tags.includes('oil') || tags.includes('grocery') || tags.includes('cereal') || tags.includes('rice') || tags.includes('flour')) return 'Groceries & Oil';
  if (tags.includes('spice') || tags.includes('masala') || tags.includes('salt') || tags.includes('sugar')) return 'Staples & Spices';
  if (tags.includes('cleaning') || tags.includes('detergent') || tags.includes('soap') || tags.includes('household')) return 'Household & Cleaning';
  return 'Snacks & Packaged Food';
};

const mapUPCCategory = (cat) => {
  if (!cat) return 'General';
  const c = cat.toLowerCase();
  if (c.includes('food') || c.includes('grocery')) return 'Groceries & Oil';
  if (c.includes('beverage') || c.includes('drink')) return 'Beverages & Drinks';
  if (c.includes('snack')) return 'Snacks & Packaged Food';
  if (c.includes('electronics') || c.includes('hardware')) return 'Electronics & Hardware';
  if (c.includes('health') || c.includes('pharma')) return 'Healthcare & Pharma';
  return 'General';
};

export const QuickAddProductModal = ({ isOpen, onClose, barcode, onProductCreatedAndAdded }) => {
  const { addProduct } = useTenant();

  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [taxRate, setTaxRate] = useState(5);
  const [category, setCategory] = useState('General');

  const [lookupStatus, setLookupStatus] = useState('idle'); // 'idle' | 'loading' | 'found' | 'notfound'
  const [lookupSource, setLookupSource] = useState('');

  const priceRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    if (isOpen && barcode) {
      // Reset
      setName('');
      setSellingPrice('');
      setMrp('');
      setTaxRate(5);
      setCategory('General');
      setLookupStatus('loading');
      setLookupSource('');

      // Auto-lookup product info from internet
      lookupBarcodeOnline(barcode).then((result) => {
        if (result && result.name) {
          setName(result.name);
          setCategory(result.category || 'General');
          if (result.mrp && result.mrp > 0) {
            setMrp(String(result.mrp));
          }
          setLookupStatus('found');
          setLookupSource(result.source);
          // Auto focus price field since name is already filled
          setTimeout(() => priceRef.current?.focus(), 100);
        } else {
          setLookupStatus('notfound');
          setTimeout(() => nameRef.current?.focus(), 100);
        }
      });
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
      initialStock: 9999
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
              <h3 className="font-bold text-white text-base">New Barcode Scanned</h3>
              <p className="text-[11px] font-mono text-emerald-400">Barcode: <span className="font-bold">{barcode}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lookup Status Banner */}
        <div className={`mx-4 mt-4 p-3 rounded-xl text-xs flex items-center gap-2.5 border ${
          lookupStatus === 'loading'
            ? 'bg-sky-500/10 border-sky-500/20 text-sky-300'
            : lookupStatus === 'found'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
        }`}>
          {lookupStatus === 'loading' && (
            <>
              <Loader2 className="w-4 h-4 shrink-0 animate-spin text-sky-400" />
              <span>Internet se product info dhundh raha hai...</span>
            </>
          )}
          {lookupStatus === 'found' && (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span><strong>Product mil gaya!</strong> {lookupSource} se auto-fill hua — sirf price confirm karo aur "Add to Bill" karo.</span>
            </>
          )}
          {lookupStatus === 'notfound' && (
            <>
              <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Product online nahi mila. Manually naam aur price bharo — stock ki zaroorat nahi!</span>
            </>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              Product Name *
              {lookupStatus === 'found' && <Globe className="w-3.5 h-3.5 text-emerald-400" />}
            </label>
            <input
              ref={nameRef}
              type="text"
              required
              placeholder="e.g. Coca Cola 750ml / Maggi 70g"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none placeholder-slate-500 ${
                lookupStatus === 'found' ? 'border-emerald-500/60 focus:border-emerald-400' : 'border-slate-700 focus:border-emerald-500'
              }`}
            />
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Selling Price (₹) *</label>
              <input
                ref={priceRef}
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
              disabled={lookupStatus === 'loading'}
              className="py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              {lookupStatus === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{lookupStatus === 'loading' ? 'Looking up...' : 'Add to Bill'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
