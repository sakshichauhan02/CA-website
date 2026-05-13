'use client'

import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  CheckCircle2, 
  Clock, 
  XCircle,
  TrendingUp,
  Users,
  Wallet,
  Loader2
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'

const dummyPayments = [
  { id: 'TXN-1001', student: 'Sakshi Chauhan', plan: 'Mentor Plan', amount: '₹4,999', status: 'Success', date: '2026-05-13 14:20', email: 'sakshi@example.com' },
  { id: 'TXN-1002', student: 'Rahul Sharma', plan: 'Pro Plan', amount: '₹1,999', status: 'Success', date: '2026-05-13 12:15', email: 'rahul@example.com' },
  { id: 'TXN-1003', student: 'Priya Verma', plan: 'Pro Plan', amount: '₹1,999', status: 'Pending', date: '2026-05-12 18:45', email: 'priya@example.com' },
  { id: 'TXN-1004', student: 'Amit Singh', plan: 'Mentor Plan', amount: '₹4,999', status: 'Success', date: '2026-05-12 10:30', email: 'amit@example.com' },
  { id: 'TXN-1005', student: 'Neha Gupta', plan: 'Pro Plan', amount: '₹1,999', status: 'Failed', date: '2026-05-11 16:20', email: 'neha@example.com' },
  { id: 'TXN-1006', student: 'Vikram Das', plan: 'Pro Plan', amount: '₹1,999', status: 'Success', date: '2026-05-11 09:15', email: 'vikram@example.com' },
  { id: 'TXN-1007', student: 'Sanya Malhotra', plan: 'Mentor Plan', amount: '₹4,999', status: 'Success', date: '2026-05-10 14:00', email: 'sanya@example.com' },
];

export default function AdminPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('not found')) {
            setError('Payments table not found. Please run the provided SQL migration to initialize the database.');
          } else {
            throw error;
          }
        }
        
        if (data) {
          // Format DB data to match UI needs
          const formatted = data.map(p => ({
            id: `TXN-${p.id}`,
            student: p.student_name || 'Student',
            email: p.student_email || 'N/A',
            plan: p.plan_type === 'pro' ? 'Pro Plan' : 'Mentor Plan',
            amount: `₹${p.amount.toLocaleString()}`,
            status: p.status === 'success' ? 'Success' : p.status === 'pending' ? 'Pending' : 'Failed',
            date: format(new Date(p.created_at), 'yyyy-MM-dd HH:mm')
          }));
          setPayments(formatted);
        }
      } catch (err: any) {
        console.error("Payments Fetch Error:", err);
        setError(err.message || 'An unexpected error occurred while fetching payments.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [supabase]);

  const filteredPayments = payments.filter(pay => {
    const matchesSearch = pay.student.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         pay.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pay.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || pay.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments.reduce((acc, curr) => {
    if (curr.status === 'Success') {
      const val = parseInt(curr.amount.replace('₹', '').replace(',', ''));
      return acc + (isNaN(val) ? 0 : val);
    }
    return acc;
  }, 0);

  const handleExportCSV = () => {
    if (filteredPayments.length === 0) {
      alert('No data to export!');
      return;
    }
    const headers = ['Transaction ID', 'Student', 'Email', 'Plan', 'Amount', 'Status', 'Date'];
    const csvData = filteredPayments.map(p => [p.id, p.student, p.email, p.plan, p.amount, p.status, p.date].join(','));
    const csvContent = [headers.join(','), ...csvData].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Live Transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 max-w-[1600px] mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-12 text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Database Initialization Required</h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
            {error}
          </p>
          <div className="flex justify-center gap-4">
             <button onClick={() => window.location.reload()} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">
               Retry Connection
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-10 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-[2px] bg-blue-600 rounded-full" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Financial Management</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">Payment Records</h1>
          <p className="text-slate-500 text-base md:text-xl font-medium mt-3">Monitor real transactions and platform revenue.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 group"
        >
          <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          Export CSV Report
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wallet size={32} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Revenue</span>
            <span className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp size={32} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Success Rate</span>
            <span className="text-2xl font-black text-slate-900">
              {payments.length > 0 ? ((payments.filter(p => p.status === 'Success').length / payments.length) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={32} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Real Transactions</span>
            <span className="text-2xl font-black text-slate-900">{payments.length}</span>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden mb-10">
        <div className="p-6 md:p-10 border-b border-slate-50 flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by student, email or TXN ID..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/10 outline-none font-medium text-sm text-slate-700 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-56">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                className="w-full pl-12 pr-8 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/10 outline-none font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer text-slate-600"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-10 py-6 text-[10px) font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                  <td className="px-10 py-8">
                    <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">{payment.id}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div>
                      <p className="font-black text-slate-800 text-lg leading-tight">{payment.student}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">{payment.email}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      payment.plan === 'Mentor Plan' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {payment.plan}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="font-black text-slate-900 text-lg">{payment.amount}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                      {payment.status === 'Success' && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                          <CheckCircle2 size={12} />
                          Success
                        </span>
                      )}
                      {payment.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                          <Clock size={12} />
                          Pending
                        </span>
                      )}
                      {payment.status === 'Failed' && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                          <XCircle size={12} />
                          Failed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-sm font-bold text-slate-400">
                    {payment.date}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => alert(`Viewing details for ${payment.id}`)}
                      className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="p-32 text-center bg-slate-50/20">
            <div className="w-24 h-24 bg-white shadow-xl rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
              <CreditCard size={48} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">No Real Records Found</h3>
            <p className="font-medium text-slate-400 max-w-sm mx-auto leading-relaxed">
              We couldn't find any real transactions in the database matching your current search or filters.
            </p>
          </div>
        )}

        {/* Footer Pagination */}
        <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Showing {filteredPayments.length} transactions from Database</p>
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 cursor-not-allowed transition-all">Previous</button>
            <button className="px-6 py-3 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm hover:shadow-lg transition-all active:scale-95">Next Page</button>
          </div>
        </div>
      </div>
    </div>
  )
}
