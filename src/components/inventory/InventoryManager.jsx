import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Plus, 
  Search, 
  FileSpreadsheet, 
  QrCode, 
  Trash2, 
  AlertTriangle, 
  Download, 
  Upload, 
  X, 
  Printer 
} from 'lucide-react';

export const InventoryManager = () => {
  const { products, activeBranch, addProduct, deleteProduct, importProducts } = useTenant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [selectedBarcodeProd, setSelectedBarcodeProd] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: 'Groceries & Oil',
    hsnCode: '1507',
    taxRate: 5,
    unit: 'pcs',
    costPrice: '',
    mrp: '',
    sellingPrice: '',
    minStockAlert: 10,
    initialStock: 50
  });

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.barcode.includes(searchQuery) ||
                          (p.hsnCode && p.hsnCode.includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sellingPrice) {
      alert('Product Name and Selling Price are required.');
      return;
    }

    const barcodeToUse = formData.barcode.trim() || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`;

    addProduct({
      ...formData,
      barcode: barcodeToUse,
      costPrice: Number(formData.costPrice || 0),
      mrp: Number(formData.mrp || formData.sellingPrice),
      sellingPrice: Number(formData.sellingPrice),
      taxRate: Number(formData.taxRate),
      minStockAlert: Number(formData.minStockAlert)
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      barcode: '',
      category: 'Groceries & Oil',
      hsnCode: '1507',
      taxRate: 5,
      unit: 'pcs',
      costPrice: '',
      mrp: '',
      sellingPrice: '',
      minStockAlert: 10,
      initialStock: 50
    });
  };

  const handleSimulatedExcelImport = () => {
    const mockExcelProducts = [
      { name: 'Parle-G Gold 100g', barcode: '8901030099881', category: 'Snacks', hsnCode: '1905', taxRate: 18, unit: 'pack', costPrice: 8, mrp: 10, sellingPrice: 10, stock: 100 },
      { name: 'Kissan Fresh Tomato Ketchup 1kg', barcode: '8901030099882', category: 'Sauces', hsnCode: '2103', taxRate: 12, unit: 'bottle', costPrice: 110, mrp: 145, sellingPrice: 130, stock: 40 },
      { name: 'Dabur Red Toothpaste 300g', barcode: '8901030099883', category: 'Personal Care', hsnCode: '3306', taxRate: 18, unit: 'pack', costPrice: 115, mrp: 140, sellingPrice: 135, stock: 25 }
    ];

    importProducts(mockExcelProducts);
    setIsImportModalOpen(false);
    alert('Imported 3 products from Excel file sample successfully!');
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Inventory & Product Catalog</h2>
          <p className="text-xs text-slate-400">Manage SKUs, stock levels, GST tax slabs, and print barcode stickers</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel / CSV Bulk Upload</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New SKU</span>
          </button>
        </div>
      </div>

      <div className="glass-card p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filter catalog by Product Name, Barcode, or HSN Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                selectedCategory === c ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-3">Barcode</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">HSN Code</th>
                <th className="p-3">GST Slab</th>
                <th className="p-3">Cost Price</th>
                <th className="p-3">Selling Price</th>
                <th className="p-3">Branch Stock</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.map(p => {
                const stock = p.stocks?.[activeBranch.id] ?? 0;
                const isLow = stock <= p.minStockAlert;
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-emerald-400 font-semibold">{p.barcode}</td>
                    <td className="p-3 font-semibold text-white">{p.name}</td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{p.hsnCode || '—'}</td>
                    <td className="p-3">
                      <span className="text-sky-400 font-mono font-semibold">{p.taxRate}%</span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">₹{p.costPrice ? p.costPrice.toFixed(2) : '0.00'}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">₹{p.sellingPrice.toFixed(2)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-bold ${isLow ? 'text-rose-400' : 'text-slate-200'}`}>
                          {stock} {p.unit}
                        </span>
                        {isLow && (
                          <span className="flex items-center gap-1 text-[9px] font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => { setSelectedBarcodeProd(p); setIsBarcodeModalOpen(true); }}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400"
                        title="Generate Barcode Labels"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if(confirm(`Delete SKU ${p.name}?`)) deleteProduct(p.id); }}
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-rose-400"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Add New Product to Catalog</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Fortune Sunflower Oil 1L Pouch"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Barcode (EAN-13 / Custom)</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Groceries & Oil">Groceries & Oil</option>
                    <option value="Dairy & Refrigerated">Dairy & Refrigerated</option>
                    <option value="Staples & Spices">Staples & Spices</option>
                    <option value="Snacks & Packaged Food">Snacks & Packaged Food</option>
                    <option value="Household & Cleaning">Household & Cleaning</option>
                    <option value="Electronics & Hardware">Electronics & Hardware</option>
                    <option value="Fresh Produce">Fresh Produce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">HSN/SAC Code</label>
                  <input
                    type="text"
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                    placeholder="1507"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GST Tax Rate (%)</label>
                  <select
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="120.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="145.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Stock ({formData.unit})</label>
                  <input
                    type="number"
                    value={formData.initialStock}
                    onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Low Stock Alert Level</label>
                  <input
                    type="number"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Bulk Excel / CSV Import</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl text-center space-y-2 bg-slate-950/50">
              <Upload className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
              <p className="text-xs font-semibold text-slate-200">Drag & Drop Catalog Spreadsheet (.xlsx, .csv)</p>
              <p className="text-[10px] text-slate-400">Columns supported: Name, Barcode, Category, HSN, TaxRate, MRP, SellingPrice, Stock</p>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => alert('Sample template downloaded (retailbill_catalog_template.xlsx)')}
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <Download className="w-3.5 h-3.5" /> Download Sample File
              </button>

              <button
                onClick={handleSimulatedExcelImport}
                className="btn-primary text-xs"
              >
                Import Sample Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      {isBarcodeModalOpen && selectedBarcodeProd && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 no-print">
              <div>
                <h3 className="font-bold text-white text-base">Printable Barcode Labels</h3>
                <p className="text-[11px] text-slate-400">{selectedBarcodeProd.name} [{selectedBarcodeProd.barcode}]</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="btn-primary text-xs flex items-center gap-1">
                  <Printer className="w-4 h-4" /> Print Sheet
                </button>
                <button onClick={() => setIsBarcodeModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="printable-area grid grid-cols-3 sm:grid-cols-4 gap-3 bg-white p-4 text-black border rounded">
              {[...Array(12)].map((_, idx) => (
                <div key={idx} className="border border-black p-2 rounded text-center space-y-1 bg-white font-mono">
                  <p className="text-[9px] font-bold leading-tight font-sans truncate">{selectedBarcodeProd.name}</p>
                  <p className="text-[8px] text-slate-600">MRP: ₹{selectedBarcodeProd.mrp} | <span className="font-bold text-black">OUR PRICE: ₹{selectedBarcodeProd.sellingPrice}</span></p>
                  
                  <div className="py-1 flex items-center justify-center gap-0.5 h-8 bg-slate-100 rounded border border-slate-300">
                    <div className="w-0.5 h-6 bg-black"></div>
                    <div className="w-1 h-6 bg-black"></div>
                    <div className="w-0.5 h-6 bg-black"></div>
                    <div className="w-1.5 h-6 bg-black"></div>
                    <div className="w-0.5 h-6 bg-black"></div>
                    <div className="w-1 h-6 bg-black"></div>
                    <div className="w-0.5 h-6 bg-black"></div>
                    <div className="w-1.5 h-6 bg-black"></div>
                  </div>
                  
                  <p className="text-[8px] font-bold tracking-widest">{selectedBarcodeProd.barcode}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
