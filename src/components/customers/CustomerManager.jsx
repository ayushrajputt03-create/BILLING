import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  ArrowDownRight, 
  ArrowUpRight, 
  FileText, 
  X, 
  Check, 
  AlertCircle, 
  IndianRupee, 
  Share2, 
  Send, 
  History, 
  Edit3, 
  Trash2,
  TrendingUp,
  Receipt,
  Printer,
  ChevronRight,
  Clock
} from 'lucide-react';
import { ThermalPrintModal } from '../pos/ThermalPrintModal';

export const CustomerManager = () => {
  const { 
    customers, 
    invoices, 
    addOrUpdateCustomer, 
    updateCustomerBalance, 
    deleteCustomer,
    currentTenant
  } = useTenant();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'outstanding' | 'settled'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [paymentCustomer, setPaymentCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash, UPI, Bank

  // Customer Ledger Drawer
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [printInvoice, setPrintInvoice] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: 5000
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      creditLimit: 5000
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cust, e) => {
    if (e) e.stopPropagation();
    setEditingCustomer(cust);
    setFormData({
      name: cust.name || '',
      phone: cust.phone || '',
      email: cust.email || '',
      address: cust.address || '',
      creditLimit: cust.creditLimit || 5000
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitCustomer = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a customer name.');
      return;
    }

    if (editingCustomer) {
      addOrUpdateCustomer({
        ...editingCustomer,
        ...formData,
        creditLimit: Number(formData.creditLimit) || 5000
      });
      if (selectedCustomer && selectedCustomer.id === editingCustomer.id) {
        setSelectedCustomer(prev => ({ ...prev, ...formData }));
      }
    } else {
      addOrUpdateCustomer({
        ...formData,
        creditLimit: Number(formData.creditLimit) || 5000
      });
    }

    setIsAddModalOpen(false);
    setEditingCustomer(null);
  };

  const handleDelete = (customerId, customerName, e) => {
    if (e) e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${customerName}" from customer records?`)) {
      deleteCustomer(customerId);
      if (selectedCustomer && selectedCustomer.id === customerId) {
        setSelectedCustomer(null);
      }
    }
  };

  const handleOpenPayment = (cust, e) => {
    if (e) e.stopPropagation();
    setPaymentCustomer(cust);
    setPaymentAmount(cust.totalOutstanding > 0 ? cust.totalOutstanding.toString() : '');
    setPaymentNote('');
    setPaymentMethod('Cash');
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid payment amount greater than zero.');
      return;
    }

    updateCustomerBalance(paymentCustomer.id, amt, 'payment_received');

    // Update selected customer view if drawer is open
    if (selectedCustomer && selectedCustomer.id === paymentCustomer.id) {
      setSelectedCustomer(prev => ({
        ...prev,
        totalOutstanding: Math.max(0, (prev.totalOutstanding || 0) - amt)
      }));
    }

    alert(`Successfully recorded payment of ₹${amt.toFixed(2)} from ${paymentCustomer.name}.`);
    setPaymentCustomer(null);
    setPaymentAmount('');
  };

  const handleSendWhatsAppReminder = (cust, e) => {
    if (e) e.stopPropagation();
    const cleanPhone = (cust.phone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Dear ${cust.name}, greetings from ${currentTenant.name}! Your outstanding Khata/Udhaar balance is ₹${(cust.totalOutstanding || 0).toFixed(2)}. Kindly arrange payment at your earliest convenience. Thank you!`
    );
    window.open(`https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${msg}`, '_blank');
  };

  // Calculations & Analytics
  const totalCustomers = customers.length;
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.totalOutstanding || 0), 0);
  const totalPurchases = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
  const customersWithUdhaar = customers.filter(c => (c.totalOutstanding || 0) > 0).length;

  // Filtering
  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (c.name && c.name.toLowerCase().includes(q)) || 
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterType === 'outstanding') return (c.totalOutstanding || 0) > 0;
    if (filterType === 'settled') return (c.totalOutstanding || 0) === 0;
    return true;
  });

  // Customer Invoices for Drawer
  const getCustomerInvoices = (cust) => {
    if (!cust) return [];
    return invoices.filter(inv => 
      (inv.customerId && inv.customerId === cust.id) || 
      (cust.phone && inv.customerPhone && inv.customerPhone.trim() === cust.phone.trim())
    );
  };

  return (
    <div className="p-3 sm:p-5 md:p-6 space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Customer Directory &amp; Udhaar (Khata) Register</span>
          </h2>
          <p className="text-xs text-slate-400">
            Manage customer credit limits, track outstanding balances, and collect Khata repayments
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-3.5 space-y-1.5 border-sky-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Total Customers</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white">{totalCustomers}</p>
          <p className="text-[10px] text-slate-400">Registered store patrons</p>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-rose-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Total Outstanding (Udhaar)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-rose-400">₹{totalOutstanding.toFixed(2)}</p>
          <p className="text-[10px] text-rose-300 font-semibold">{customersWithUdhaar} accounts pending repayment</p>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Lifetime Purchases</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white">₹{totalPurchases.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400">Cumulative customer billing</p>
        </div>

        <div className="glass-card p-3.5 space-y-1.5 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Khata Accounts</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white">{customersWithUdhaar}</p>
          <p className="text-[10px] text-slate-400">Active credit customers</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer name, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: `All (${customers.length})` },
            { id: 'outstanding', label: `Pending Udhaar (${customersWithUdhaar})` },
            { id: 'settled', label: `Cleared Balance (${customers.length - customersWithUdhaar})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === f.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List Table */}
      <div className="glass-card overflow-hidden border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-3">Customer Profile</th>
                <th className="p-3">Phone &amp; Contact</th>
                <th className="p-3 text-right">Total Purchases</th>
                <th className="p-3 text-right">Khata / Udhaar Balance</th>
                <th className="p-3 text-right hidden md:table-cell">Credit Limit</th>
                <th className="p-3 hidden lg:table-cell">Last Visit</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                    <p className="text-sm font-semibold">No customers found matching your criteria</p>
                    <p className="text-xs text-slate-500 mt-1">Add a new customer or try adjusting your search filters</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => {
                  const hasUdhaar = (cust.totalOutstanding || 0) > 0;
                  return (
                    <tr 
                      key={cust.id} 
                      onClick={() => setSelectedCustomer(cust)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            hasUdhaar 
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {(cust.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                              {cust.name}
                            </p>
                            {cust.address && (
                              <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{cust.address}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="space-y-0.5">
                          <p className="font-mono text-slate-300 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span>{cust.phone || '—'}</span>
                          </p>
                          {cust.email && (
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span className="truncate max-w-[140px]">{cust.email}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-right font-mono font-semibold text-slate-200">
                        ₹{(cust.totalPurchases || 0).toFixed(2)}
                      </td>

                      <td className="p-3 text-right">
                        {hasUdhaar ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold font-mono text-xs animate-pulse">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>₹{(cust.totalOutstanding || 0).toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                            <Check className="w-3 h-3" />
                            <span>₹0.00</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right font-mono text-slate-400 hidden md:table-cell">
                        ₹{(cust.creditLimit || 5000).toLocaleString('en-IN')}
                      </td>

                      <td className="p-3 text-slate-400 text-[11px] hidden lg:table-cell">
                        {cust.lastVisit ? new Date(cust.lastVisit).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : '—'}
                      </td>

                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {hasUdhaar && (
                            <>
                              <button
                                onClick={(e) => handleOpenPayment(cust, e)}
                                title="Record Repayment"
                                className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-lg text-[11px] shadow-sm flex items-center gap-1 transition-all"
                              >
                                <IndianRupee className="w-3 h-3" />
                                <span>Record Pay</span>
                              </button>

                              {cust.phone && (
                                <button
                                  onClick={(e) => handleSendWhatsAppReminder(cust, e)}
                                  title="Send WhatsApp Khata Reminder"
                                  className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs transition-colors"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}

                          <button
                            onClick={(e) => handleOpenEdit(cust, e)}
                            title="Edit Customer"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => handleDelete(cust.id, cust.name, e)}
                            title="Delete Record"
                            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors border border-slate-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
          <div className="bg-slate-900 border-l border-slate-700 w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  {(selectedCustomer.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedCustomer.phone || 'No phone registered'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(selectedCustomer)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Financial Snapshot Card */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Khata Outstanding</p>
                  <p className={`text-xl font-bold font-mono mt-0.5 ${
                    (selectedCustomer.totalOutstanding || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    ₹{(selectedCustomer.totalOutstanding || 0).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Limit: ₹{(selectedCustomer.creditLimit || 5000).toLocaleString('en-IN')}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Purchases</p>
                  <p className="text-xl font-bold font-mono text-white mt-0.5">
                    ₹{(selectedCustomer.totalPurchases || 0).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {getCustomerInvoices(selectedCustomer).length} past bills
                  </p>
                </div>

                {(selectedCustomer.totalOutstanding || 0) > 0 && (
                  <div className="col-span-2 pt-2 border-t border-slate-700 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenPayment(selectedCustomer)}
                      className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>Record Payment Receipt</span>
                    </button>

                    {selectedCustomer.phone && (
                      <button
                        onClick={() => handleSendWhatsAppReminder(selectedCustomer)}
                        className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp Reminder</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Customer Contact & Meta Details */}
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Contact &amp; Account Info</h4>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-start gap-2 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{selectedCustomer.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Customer Since: {new Date(selectedCustomer.createdDate || Date.now()).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Invoices History Ledger */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Purchase &amp; Bill Ledger</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {getCustomerInvoices(selectedCustomer).length} records
                  </span>
                </div>

                <div className="space-y-2">
                  {getCustomerInvoices(selectedCustomer).length === 0 ? (
                    <div className="p-6 text-center text-slate-500 rounded-xl bg-slate-800/30 border border-slate-800">
                      <FileText className="w-8 h-8 mx-auto mb-1 text-slate-600 opacity-60" />
                      <p className="text-xs font-semibold">No recorded invoices yet</p>
                      <p className="text-[10px] text-slate-500">Invoices billed to this customer will appear here</p>
                    </div>
                  ) : (
                    getCustomerInvoices(selectedCustomer).map(inv => (
                      <div 
                        key={inv.id} 
                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-400">{inv.invoiceNumber}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              inv.paymentMode === 'Udhaar'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-700 text-slate-300'
                            }`}>
                              {inv.paymentMode}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {new Date(inv.timestamp).toLocaleString('en-IN')} • {inv.items?.length || 0} item(s)
                          </p>
                        </div>

                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className="font-bold font-mono text-white text-sm">₹{inv.grandTotal.toFixed(2)}</p>
                            <span className="text-[10px] text-slate-400">{inv.paymentStatus || 'Paid'}</span>
                          </div>
                          <button
                            onClick={() => setPrintInvoice(inv)}
                            title="Reprint Bill"
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">Record Khata Repayment</h3>
                  <p className="text-[11px] text-slate-400">Customer: {paymentCustomer.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setPaymentCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-4 space-y-4">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 flex justify-between items-center text-xs">
                <span className="text-slate-400">Current Outstanding:</span>
                <span className="font-mono font-bold text-rose-400 text-base">
                  ₹{(paymentCustomer.totalOutstanding || 0).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Amount Received (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-mono text-slate-500 text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={paymentCustomer.totalOutstanding || undefined}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount..."
                    required
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(paymentCustomer.totalOutstanding.toString())}
                    className="px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold whitespace-nowrap"
                  >
                    Full Balance (₹{paymentCustomer.totalOutstanding})
                  </button>
                  {[500, 1000, 2000].map(val => (
                    val <= paymentCustomer.totalOutstanding && (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPaymentAmount(val.toString())}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono whitespace-nowrap"
                      >
                        ₹{val}
                      </button>
                    )
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'UPI', 'Bank'].map(mode => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setPaymentMethod(mode)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        paymentMethod === mode
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Note / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. UPI Ref #8234 / Cash counter receipt"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentCustomer(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Repayment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">
                  {editingCustomer ? 'Edit Customer Information' : 'Add New Customer Profile'}
                </h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCustomer} className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Mobile Phone (+91...) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@domain.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Store Address / Locality
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Flat 301, Lakeview Apts, Main Road"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Udhaar / Khata Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                    placeholder="5000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Maximum allowed unpaid store credit for this customer</p>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCustomer ? 'Update Customer' : 'Save Customer Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Reprint Modal */}
      <ThermalPrintModal
        isOpen={Boolean(printInvoice)}
        onClose={() => setPrintInvoice(null)}
        invoice={printInvoice}
      />
    </div>
  );
};
