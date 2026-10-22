// RetailBill Comprehensive Mock Dataset for Multi-Tenant POS SaaS

export const INITIAL_TENANTS = [
  {
    id: 'tenant-rajesh-kirana',
    name: 'Rajesh Kirana & General Store',
    slug: 'rajesh-kirana',
    plan: 'Starter',
    maxBranches: 1,
    gstin: '07AAAAA0000A1Z5',
    ownerName: 'Rajesh Kumar',
    ownerPhone: '+91 98765 43210',
    ownerEmail: 'rajesh@kirana.in',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Shop 14, Main Market, Connaught Place, New Delhi - 110001',
    branches: [
      { id: 'br-rajesh-main', name: 'Main Counter', code: 'DEL-01', phone: '+91 98765 43210', address: 'Shop 14, Main Market, Connaught Place' }
    ],
    createdDate: '2025-11-10',
    status: 'Active'
  },
  {
    id: 'tenant-meena-supermarket',
    name: 'Meena Supermarket & Departmental Chain',
    slug: 'meena-supermarket',
    plan: 'Growth',
    maxBranches: 5,
    gstin: '29ABCDE1234F1Z9',
    ownerName: 'Meena Sharma',
    ownerPhone: '+91 98111 22233',
    ownerEmail: 'meena@meenaretail.com',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: '100ft Road, Indiranagar, Bengaluru - 560038',
    branches: [
      { id: 'br-meena-1', name: 'Indiranagar Flagship', code: 'BLR-01', phone: '+91 98111 22233', address: '100ft Road, Indiranagar, Bengaluru' },
      { id: 'br-meena-2', name: 'Koramangala Branch', code: 'BLR-02', phone: '+91 98111 22244', address: '80ft Road, 4th Block, Koramangala' },
      { id: 'br-meena-3', name: 'Whitefield Hypermarket', code: 'BLR-03', phone: '+91 98111 22255', address: 'ITPL Main Road, Whitefield' }
    ],
    createdDate: '2025-06-15',
    status: 'Active'
  },
  {
    id: 'tenant-apex-retail',
    name: 'Apex Mega Mart Chains',
    slug: 'apex-retail',
    plan: 'Enterprise',
    maxBranches: 25,
    gstin: '27XYZAB9876C1Z2',
    ownerName: 'Vikramaditya Rao',
    ownerPhone: '+91 99999 88888',
    ownerEmail: 'admin@apexmegamart.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Apex Tower, Bandra Kurla Complex, Mumbai - 400051',
    branches: [
      { id: 'br-apex-1', name: 'BKC Central', code: 'MUM-01', phone: '+91 99999 88881', address: 'BKC, Mumbai' },
      { id: 'br-apex-2', name: 'Andheri West', code: 'MUM-02', phone: '+91 99999 88882', address: 'Link Road, Andheri West' }
    ],
    createdDate: '2024-03-01',
    status: 'Active'
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    tenantId: 'tenant-rajesh-kirana',
    barcode: '8901030300001',
    name: 'Fortune Sunflower Oil 1L Pouch',
    category: 'Groceries & Oil',
    hsnCode: '1507',
    taxRate: 5,
    unit: 'pouch',
    costPrice: 128.00,
    mrp: 155.00,
    sellingPrice: 145.00,
    minStockAlert: 15,
    stocks: {
      'br-rajesh-main': 42
    }
  },
  {
    id: 'prod-002',
    tenantId: 'tenant-rajesh-kirana',
    barcode: '8901058852341',
    name: 'Amul Pasteurised Butter 500g',
    category: 'Dairy & Refrigerated',
    hsnCode: '0405',
    taxRate: 12,
    unit: 'pack',
    costPrice: 245.00,
    mrp: 275.00,
    sellingPrice: 270.00,
    minStockAlert: 10,
    stocks: {
      'br-rajesh-main': 8
    }
  },
  {
    id: 'prod-003',
    tenantId: 'tenant-rajesh-kirana',
    barcode: '8901725111223',
    name: 'Tata Salt Vacuum Evaporated 1kg',
    category: 'Staples & Spices',
    hsnCode: '2501',
    taxRate: 0,
    unit: 'pack',
    costPrice: 22.00,
    mrp: 28.00,
    sellingPrice: 26.00,
    minStockAlert: 20,
    stocks: {
      'br-rajesh-main': 120
    }
  },
  {
    id: 'prod-004',
    tenantId: 'tenant-rajesh-kirana',
    barcode: '8901030001234',
    name: 'Maggi 2-Minute Masala Noodles 280g (Pack of 4)',
    category: 'Snacks & Packaged Food',
    hsnCode: '1902',
    taxRate: 12,
    unit: 'pack',
    costPrice: 52.00,
    mrp: 60.00,
    sellingPrice: 58.00,
    minStockAlert: 15,
    stocks: {
      'br-rajesh-main': 35
    }
  },
  {
    id: 'prod-005',
    tenantId: 'tenant-rajesh-kirana',
    barcode: '8901030045678',
    name: 'Aashirvaad Shuddh Chakki Atta 5kg',
    category: 'Staples & Spices',
    hsnCode: '1101',
    taxRate: 5,
    unit: 'bag',
    costPrice: 215.00,
    mrp: 265.00,
    sellingPrice: 245.00,
    minStockAlert: 8,
    stocks: {
      'br-rajesh-main': 18
    }
  },
  {
    id: 'prod-101',
    tenantId: 'tenant-meena-supermarket',
    barcode: '8901234567890',
    name: 'Britannia Good Day Cashew 600g Family Pack',
    category: 'Snacks & Biscuits',
    hsnCode: '1905',
    taxRate: 18,
    unit: 'pack',
    costPrice: 110.00,
    mrp: 150.00,
    sellingPrice: 135.00,
    minStockAlert: 25,
    stocks: {
      'br-meena-1': 85,
      'br-meena-2': 14,
      'br-meena-3': 110
    }
  },
  {
    id: 'prod-102',
    tenantId: 'tenant-meena-supermarket',
    barcode: '8901058000999',
    name: 'Amul Taaza T-Special Milk 1L Tetra Pak',
    category: 'Dairy & Refrigerated',
    hsnCode: '0401',
    taxRate: 0,
    unit: 'pack',
    costPrice: 66.00,
    mrp: 74.00,
    sellingPrice: 72.00,
    minStockAlert: 30,
    stocks: {
      'br-meena-1': 140,
      'br-meena-2': 90,
      'br-meena-3': 160
    }
  },
  {
    id: 'prod-103',
    tenantId: 'tenant-meena-supermarket',
    barcode: '8908000111222',
    name: 'Syska 9W LED Cool Day Light Bulb (B22)',
    category: 'Electronics & Hardware',
    hsnCode: '8539',
    taxRate: 18,
    unit: 'piece',
    costPrice: 65.00,
    mrp: 149.00,
    sellingPrice: 99.00,
    minStockAlert: 10,
    stocks: {
      'br-meena-1': 30,
      'br-meena-2': 45,
      'br-meena-3': 5
    }
  },
  {
    id: 'prod-104',
    tenantId: 'tenant-meena-supermarket',
    barcode: '8904000123999',
    name: 'Boat Bassheads 100 In-Ear Wired Earphones (Black)',
    category: 'Electronics & Accessories',
    hsnCode: '8518',
    taxRate: 18,
    unit: 'piece',
    costPrice: 280.00,
    mrp: 999.00,
    sellingPrice: 399.00,
    minStockAlert: 5,
    stocks: {
      'br-meena-1': 24,
      'br-meena-2': 18,
      'br-meena-3': 30
    }
  },
  {
    id: 'prod-105',
    tenantId: 'tenant-meena-supermarket',
    barcode: '8901030998877',
    name: 'Surf Excel Easy Wash Detergent Powder 1kg',
    category: 'Household & Cleaning',
    hsnCode: '3402',
    taxRate: 18,
    unit: 'pack',
    costPrice: 118.00,
    mrp: 145.00,
    sellingPrice: 132.00,
    minStockAlert: 20,
    stocks: {
      'br-meena-1': 50,
      'br-meena-2': 40,
      'br-meena-3': 65
    }
  },
  {
    id: 'prod-106',
    tenantId: 'tenant-meena-supermarket',
    barcode: 'LOOSE-POTATO-KG',
    name: 'Fresh Local Potato (Loose per KG)',
    category: 'Fresh Produce',
    hsnCode: '0701',
    taxRate: 0,
    unit: 'kg',
    costPrice: 18.00,
    mrp: 35.00,
    sellingPrice: 28.00,
    minStockAlert: 50,
    stocks: {
      'br-meena-1': 250,
      'br-meena-2': 180,
      'br-meena-3': 300
    }
  }
];

export const INITIAL_INVOICES = [
  {
    id: 'inv-1001',
    invoiceNumber: 'INV/2026/001',
    tenantId: 'tenant-rajesh-kirana',
    branchId: 'br-rajesh-main',
    branchName: 'Main Counter',
    customerName: 'Suresh Kumar',
    customerPhone: '+91 98999 11111',
    items: [
      { productId: 'prod-001', name: 'Fortune Sunflower Oil 1L Pouch', hsnCode: '1507', qty: 2, price: 145.00, taxRate: 5, discount: 0, lineTotal: 290.00 },
      { productId: 'prod-003', name: 'Tata Salt Vacuum Evaporated 1kg', hsnCode: '2501', qty: 1, price: 26.00, taxRate: 0, discount: 0, lineTotal: 26.00 }
    ],
    subtotal: 316.00,
    discountTotal: 10.00,
    cgstTotal: 7.25,
    sgstTotal: 7.25,
    igstTotal: 0,
    grandTotal: 313.25,
    paymentMode: 'UPI',
    paymentStatus: 'Paid',
    cashierName: 'Rajesh Kumar',
    timestamp: '2026-07-23T14:20:00+05:30'
  },
  {
    id: 'inv-1002',
    invoiceNumber: 'INV/2026/002',
    tenantId: 'tenant-meena-supermarket',
    branchId: 'br-meena-1',
    branchName: 'Indiranagar Flagship',
    customerName: 'Ananya Rao',
    customerPhone: '+91 97400 55443',
    items: [
      { productId: 'prod-101', name: 'Britannia Good Day Cashew 600g', hsnCode: '1905', qty: 2, price: 135.00, taxRate: 18, discount: 0, lineTotal: 270.00 },
      { productId: 'prod-104', name: 'Boat Bassheads 100 Wired Earphones', hsnCode: '8518', qty: 1, price: 399.00, taxRate: 18, discount: 0, lineTotal: 399.00 }
    ],
    subtotal: 669.00,
    discountTotal: 20.00,
    cgstTotal: 60.21,
    sgstTotal: 60.21,
    igstTotal: 0,
    grandTotal: 769.42,
    paymentMode: 'Cash',
    paymentStatus: 'Paid',
    cashierName: 'Ramesh (Indiranagar)',
    timestamp: '2026-07-23T16:45:00+05:30'
  }
];

export const INITIAL_STOCK_TRANSFERS = [
  {
    id: 'tr-801',
    tenantId: 'tenant-meena-supermarket',
    transferNumber: 'TRF-2026-004',
    fromBranchId: 'br-meena-1',
    fromBranchName: 'Indiranagar Flagship',
    toBranchId: 'br-meena-2',
    toBranchName: 'Koramangala Branch',
    items: [
      { productId: 'prod-101', name: 'Britannia Good Day Cashew 600g', qty: 30 },
      { productId: 'prod-103', name: 'Syska 9W LED Cool Day Light Bulb', qty: 15 }
    ],
    status: 'In Transit',
    initiatedBy: 'Sunil Verma (Manager)',
    date: '2026-07-23'
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust-101',
    tenantId: 'tenant-rajesh-kirana',
    name: 'Suresh Kumar',
    phone: '+91 98999 11111',
    email: 'suresh.k@gmail.com',
    address: 'Flat 204, CP Enclave, New Delhi',
    totalPurchases: 4320.00,
    totalOutstanding: 650.00,
    creditLimit: 5000,
    createdDate: '2026-05-10T10:00:00.000Z',
    lastVisit: '2026-07-23T14:20:00.000Z'
  },
  {
    id: 'cust-102',
    tenantId: 'tenant-rajesh-kirana',
    name: 'Amit Sharma',
    phone: '+91 98123 45678',
    email: 'amit.sharma99@yahoo.com',
    address: 'B-12, Sector 4, Rohini, Delhi',
    totalPurchases: 8940.00,
    totalOutstanding: 1450.00,
    creditLimit: 8000,
    createdDate: '2026-04-12T11:30:00.000Z',
    lastVisit: '2026-07-20T18:15:00.000Z'
  },
  {
    id: 'cust-103',
    tenantId: 'tenant-rajesh-kirana',
    name: 'Priya Verma',
    phone: '+91 98765 44433',
    email: 'priya.v@outlook.com',
    address: 'House 88, Janpath, New Delhi',
    totalPurchases: 2450.00,
    totalOutstanding: 0.00,
    creditLimit: 3000,
    createdDate: '2026-06-01T09:00:00.000Z',
    lastVisit: '2026-07-22T12:00:00.000Z'
  },
  {
    id: 'cust-201',
    tenantId: 'tenant-meena-supermarket',
    name: 'Ananya Rao',
    phone: '+91 97400 55443',
    email: 'ananya.rao@gmail.com',
    address: '45, 12th Main, Indiranagar, Bengaluru',
    totalPurchases: 5780.00,
    totalOutstanding: 920.00,
    creditLimit: 10000,
    createdDate: '2026-03-15T10:30:00.000Z',
    lastVisit: '2026-07-23T16:45:00.000Z'
  }
];

export const INITIAL_RETURNS = [
  {
    id: 'ret-1001',
    tenantId: 'tenant-rajesh-kirana',
    branchId: 'br-rajesh-main',
    returnNumber: 'RET-001',
    originalInvoiceId: 'inv-1001',
    originalInvoiceNumber: 'INV/2026/001',
    customerName: 'Suresh Kumar',
    customerPhone: '+91 98999 11111',
    items: [
      { productId: 'prod-003', name: 'Tata Salt Vacuum Evaporated 1kg', qty: 1, price: 26.00 }
    ],
    refundAmount: 26.00,
    refundMode: 'Cash',
    reason: 'Customer bought extra packet by mistake',
    processedBy: 'Rajesh Kumar',
    timestamp: '2026-07-23T17:10:00.000Z'
  }
];
