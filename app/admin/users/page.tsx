'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Mail, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  UserCheck,
  CreditCard,
  FileText
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { toast } from 'sonner'

const USERS_PER_PAGE = 10

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const supabase = createClient()
  const [roleFilter, setRoleFilter] = useState('All')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          subscriptions(plan_type, status),
          test_results(count)
        `, { count: 'exact' })
        .order('updated_at', { ascending: false })

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      if (roleFilter !== 'All') {
        query = query.eq('role', roleFilter.toLowerCase())
      }

      // Pagination
      const from = (currentPage - 1) * USERS_PER_PAGE
      const to = from + USERS_PER_PAGE - 1
      
      const { data, count, error } = await query.range(from, to)

      if (error) throw error

      setUsers(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error("Admin Users Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, search, roleFilter])

  const exportToCSV = () => {
    if (users.length === 0) {
      toast.error("No data to export")
      return
    }
    
    const headers = ["Name", "Email", "Role", "Joined Date"]
    const rows = users.map(u => [
      u.full_name || 'Anonymous',
      u.email,
      u.role || 'user',
      format(new Date(u.updated_at), 'yyyy-MM-dd')
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `ca_students_${format(new Date(), 'yyyy_MM_dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("CSV Exported successfully!")
  }

  const totalPages = Math.ceil(totalCount / USERS_PER_PAGE)

  return (
    <div className="p-10 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
           <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-[2px] bg-blue-600 rounded-full" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">User Management</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 text-lg font-medium mt-2">Manage profiles, track test activity, and monitor subscriptions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-4 bg-white text-slate-700 font-black rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Download size={18} />
            Export Data
          </button>
        </div>
      </header>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/10 outline-none font-bold text-slate-700 transition-all"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          {['All', 'Admin', 'User'].map((role) => (
            <button 
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                roleFilter === role 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Plan</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tests Taken</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-10 py-8">
                      <div className="h-12 bg-slate-100 rounded-2xl w-full" />
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          {user.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg leading-tight flex items-center gap-2">
                            {user.full_name || 'Anonymous Student'}
                            {user.role === 'admin' && <Shield size={14} className="text-blue-500" title="Admin User" />}
                          </p>
                          <p className="text-sm font-bold text-slate-400 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          user.subscriptions?.[0]?.plan_type === 'premium' 
                            ? 'bg-amber-50 text-amber-600 border-amber-100' 
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          <CreditCard size={10} />
                          {user.subscriptions?.[0]?.plan_type || 'Free Plan'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <div className="flex flex-col items-center gap-1">
                        <span className="font-black text-slate-900 text-xl">{user.test_results?.[0]?.count || 0}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attempts</span>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-slate-500 font-bold text-sm">
                        {format(new Date(user.updated_at), 'MMM dd, yyyy')}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all shadow-sm">
                          <Mail size={18} />
                        </button>
                        <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm">
                          <FileText size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Search size={32} />
                      </div>
                      <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No students found matching your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-10 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-400">
            Showing <span className="text-slate-900 font-black">{(currentPage - 1) * USERS_PER_PAGE + 1} - {Math.min(currentPage * USERS_PER_PAGE, totalCount)}</span> of <span className="text-slate-900 font-black">{totalCount}</span> students
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-3 border border-slate-200 rounded-2xl text-slate-400 hover:bg-white hover:text-blue-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                    currentPage === i + 1 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'text-slate-500 hover:bg-white hover:text-blue-600 border border-transparent hover:border-slate-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-3 border border-slate-200 rounded-2xl text-slate-400 hover:bg-white hover:text-blue-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
