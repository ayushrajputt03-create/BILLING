import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_TENANTS, INITIAL_PRODUCTS, INITIAL_INVOICES, INITIAL_STOCK_TRANSFERS } from '../data/mockData';

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const getStored = (key, defaultVal) => {
    try {
      const stored = localStorage.getItem(`retailbill_${key}`);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  };

  const setStored = (key, val) => {
    try {
      localStorage.setItem(`retailbill_${key}`, JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  };

  const [tenants, setTenants] = useState(() => getStored('tenants', INITIAL_TENANTS));
  const [currentTenantId, setCurrentTenantId] = useState(() => getStored('currentTenantId', 'tenant-rajesh-kirana'));
  const [currentBranchId, setCurrentBranchId] = useState(() => getStored('currentBranchId', 'br-rajesh-main'));
  const [userRole, setUserRole] = useState(() => getStored('userRole', 'Owner'));
  const [userName, setUserName] = useState(() => getStored('userName', 'Rajesh Kumar'));
  const [products, setProducts] = useState(() => getStored('products', INITIAL_PRODUCTS));
  const [invoices, setInvoices] = useState(() => getStored('invoices', INITIAL_INVOICES));
  const [stockTransfers, setStockTransfers] = useState(() => getStored('stockTransfers', INITIAL_STOCK_TRANSFERS));
  const [theme, setTheme] = useState(() => getStored('theme', 'light'));
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => { setStored('tenants', tenants); }, [tenants]);
  useEffect(() => { setStored('currentTenantId', currentTenantId); }, [currentTenantId]);
  useEffect(() => { setStored('currentBranchId', currentBranchId); }, [currentBranchId]);
  useEffect(() => { setStored('userRole', userRole); }, [userRole]);
  useEffect(() => { setStored('userName', userName); }, [userName]);
  useEffect(() => { setStored('products', products); }, [products]);
  useEffect(() => { setStored('invoices', invoices); }, [invoices]);
  useEffect(() => { setStored('stockTransfers', stockTransfers); }, [stockTransfers]);
  useEffect(() => { setStored('theme', theme); document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const currentTenant = tenants.find(t => t.id === currentTenantId) || tenants[0];
  const activeBranch = currentTenant.branches.find(b => b.id === currentBranchId) || currentTenant.branches[0];

  const switchTenant = (tenantId) => {
    const target = tenants.find(t => t.id === tenantId);
    if (target) {
      setCurrentTenantId(target.id);
      if (target.branches && target.branches.length > 0) {
        setCurrentBranchId(target.branches[0].id);
      }
      if (userRole !== 'SuperAdmin') {
        setUserRole('Owner');
        setUserName(target.ownerName);
      }
    }
  };

  const switchBranch = (branchId) => {
    const targetBr = currentTenant.branches.find(b => b.id === branchId);
    if (targetBr) {
      setCurrentBranchId(targetBr.id);
    }
  };

  const switchRole = (newRole) => {
    setUserRole(newRole);
    if (newRole === 'SuperAdmin') {
      setUserName('NXT Elevata Platform Admin');
    } else if (newRole === 'Owner') {
      setUserName(currentTenant.ownerName);
    } else if (newRole === 'Manager') {
      setUserName('Sunil Verma (Manager)');
    } else {
      setUserName('Cashier Counter 1');
    }
  };

  const tenantProducts = products.filter(p => p.tenantId === currentTenantId);

  const addProduct = (newProdData) => {
    const newProduct = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      tenantId: currentTenantId,
      stocks: newProdData.stocks || { [currentBranchId]: Number(newProdData.initialStock || 0) }
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (prodId, updatedFields) => {
    setProducts(prev => prev.map(p => p.id === prodId ? { ...p, ...updatedFields } : p));
  };

  const deleteProduct = (prodId) => {
    setProducts(prev => prev.filter(p => p.id !== prodId));
  };

  const importProducts = (importedList) => {
    const formatted = importedList.map((item, idx) => ({
      id: `prod-imp-${Date.now()}-${idx}`,
      tenantId: currentTenantId,
      barcode: item.barcode || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      name: item.name,
      category: item.category || 'General',
      hsnCode: item.hsnCode || '9999',
      taxRate: Number(item.taxRate || 0),
      unit: item.unit || 'pcs',
      costPrice: Number(item.costPrice || 0),
      mrp: Number(item.mrp || item.sellingPrice || 0),
      sellingPrice: Number(item.sellingPrice || 0),
      minStockAlert: Number(item.minStockAlert || 10),
      stocks: {
        [currentBranchId]: Number(item.stock || 0)
      }
    }));
    setProducts(prev => [...formatted, ...prev]);
  };

  const tenantInvoices = invoices.filter(inv => inv.tenantId === currentTenantId);

  const createInvoice = (cartItems, paymentInfo, customerInfo, billDiscount = 0) => {
    const branchInvoicesCount = tenantInvoices.filter(inv => inv.branchId === currentBranchId).length;
    const invSeq = String(branchInvoicesCount + 1).padStart(3, '0');
    const branchCode = activeBranch.code || 'MAIN';
    const invoiceNum = `INV/${new Date().getFullYear()}/${branchCode}-${invSeq}`;

    let subtotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;

    const formattedItems = cartItems.map(item => {
      const lineSubtotal = item.sellingPrice * item.qty - (item.discount || 0);
      subtotal += lineSubtotal;

      const taxRate = item.taxRate || 0;
      const taxAmount = (lineSubtotal * taxRate) / 100;
      cgstTotal += taxAmount / 2;
      sgstTotal += taxAmount / 2;

      return {
        productId: item.id,
        name: item.name,
        hsnCode: item.hsnCode || '9999',
        qty: item.qty,
        unit: item.unit || 'pcs',
        price: item.sellingPrice,
        taxRate: taxRate,
        discount: item.discount || 0,
        lineTotal: lineSubtotal
      };
    });

    const netSubtotal = Math.max(0, subtotal - billDiscount);
    const grandTotal = Math.round((netSubtotal + cgstTotal + sgstTotal) * 100) / 100;

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      tenantId: currentTenantId,
      branchId: currentBranchId,
      branchName: activeBranch.name,
      customerName: customerInfo.name || 'Walk-in Customer',
      customerPhone: customerInfo.phone || '',
      items: formattedItems,
      subtotal: subtotal,
      discountTotal: billDiscount,
      cgstTotal: Math.round(cgstTotal * 100) / 100,
      sgstTotal: Math.round(sgstTotal * 100) / 100,
      igstTotal: 0,
      grandTotal: grandTotal,
      paymentMode: paymentInfo.mode,
      paymentStatus: 'Paid',
      cashierName: userName,
      timestamp: new Date().toISOString()
    };

    setProducts(prev => prev.map(p => {
      const cartMatch = cartItems.find(c => c.id === p.id);
      if (cartMatch) {
        const currentStock = p.stocks?.[currentBranchId] ?? 0;
        const newStock = Math.max(0, currentStock - cartMatch.qty);
        return {
          ...p,
          stocks: {
            ...p.stocks,
            [currentBranchId]: newStock
          }
        };
      }
      return p;
    }));

    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const tenantTransfers = stockTransfers.filter(tr => tr.tenantId === currentTenantId);

  const initiateStockTransfer = (fromBranchId, toBranchId, transferItems) => {
    const fromBr = currentTenant.branches.find(b => b.id === fromBranchId);
    const toBr = currentTenant.branches.find(b => b.id === toBranchId);

    const newTrf = {
      id: `tr-${Date.now()}`,
      tenantId: currentTenantId,
      transferNumber: `TRF-2026-${String(tenantTransfers.length + 1).padStart(3, '0')}`,
      fromBranchId,
      fromBranchName: fromBr.name,
      toBranchId,
      toBranchName: toBr.name,
      items: transferItems,
      status: 'In Transit',
      initiatedBy: userName,
      date: new Date().toISOString().split('T')[0]
    };

    setProducts(prev => prev.map(p => {
      const itemMatch = transferItems.find(i => i.productId === p.id);
      if (itemMatch) {
        const currentFromStock = p.stocks?.[fromBranchId] ?? 0;
        return {
          ...p,
          stocks: {
            ...p.stocks,
            [fromBranchId]: Math.max(0, currentFromStock - itemMatch.qty)
          }
        };
      }
      return p;
    }));

    setStockTransfers(prev => [newTrf, ...prev]);
  };

  const receiveStockTransfer = (transferId) => {
    const trf = stockTransfers.find(t => t.id === transferId);
    if (!trf || trf.status === 'Completed') return;

    setProducts(prev => prev.map(p => {
      const itemMatch = trf.items.find(i => i.productId === p.id);
      if (itemMatch) {
        const currentToStock = p.stocks?.[trf.toBranchId] ?? 0;
        return {
          ...p,
          stocks: {
            ...p.stocks,
            [trf.toBranchId]: currentToStock + itemMatch.qty
          }
        };
      }
      return p;
    }));

    setStockTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'Completed', receivedBy: userName, receivedDate: new Date().toISOString().split('T')[0] } : t));
  };

  const addNewTenant = (tenantForm) => {
    const newId = `tenant-${tenantForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const newTenantObj = {
      id: newId,
      name: tenantForm.name,
      slug: tenantForm.slug || newId,
      plan: tenantForm.plan || 'Starter',
      maxBranches: tenantForm.plan === 'Enterprise' ? 25 : tenantForm.plan === 'Growth' ? 5 : 1,
      gstin: tenantForm.gstin || '29AAAAA0000A1Z5',
      ownerName: tenantForm.ownerName,
      ownerPhone: tenantForm.ownerPhone,
      ownerEmail: tenantForm.ownerEmail,
      city: tenantForm.city,
      state: tenantForm.state,
      address: tenantForm.address,
      branches: [
        { id: `br-${newId}-main`, name: 'Main Counter', code: 'BR-01', phone: tenantForm.ownerPhone, address: tenantForm.address }
      ],
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    setTenants(prev => [...prev, newTenantObj]);
    switchTenant(newId);
  };

  const updateTenantPlan = (tenantId, newPlan) => {
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, plan: newPlan, maxBranches: newPlan === 'Enterprise' ? 25 : newPlan === 'Growth' ? 5 : 1 } : t));
  };

  const resetDemoData = () => {
    localStorage.clear();
    setTenants(INITIAL_TENANTS);
    setCurrentTenantId('tenant-rajesh-kirana');
    setCurrentBranchId('br-rajesh-main');
    setUserRole('Owner');
    setUserName('Rajesh Kumar');
    setProducts(INITIAL_PRODUCTS);
    setInvoices(INITIAL_INVOICES);
    setStockTransfers(INITIAL_STOCK_TRANSFERS);
  };

  return (
    <TenantContext.Provider value={{
      tenants,
      currentTenant,
      currentTenantId,
      activeBranch,
      currentBranchId,
      userRole,
      userName,
      theme,
      setTheme,
      isOnline,
      products: tenantProducts,
      allProducts: products,
      invoices: tenantInvoices,
      stockTransfers: tenantTransfers,
      switchTenant,
      switchBranch,
      switchRole,
      addProduct,
      updateProduct,
      deleteProduct,
      importProducts,
      createInvoice,
      initiateStockTransfer,
      receiveStockTransfer,
      addNewTenant,
      updateTenantPlan,
      resetDemoData
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
