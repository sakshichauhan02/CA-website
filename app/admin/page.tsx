'use client'

import React, { useEffect, useState } from 'react'
import { 
  Users, 
  CreditCard, 
  Target, 
  TrendingUp, 
  FileText,
  Loader2,
  ArrowUpRight,
  History
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'

function StatsCard({ title, value, icon: Icon, color, subtitle }: any) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform ${color}`}>
        <Icon size={24} className="md:w-[28px] md:h-[28px]" />
      </div>
      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">{value}</h3>
      </div>
      {subtitle && <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-2">{subtitle}</p>}
    </div>
  )
}


export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeSubs: 0,
    totalRevenue: 0,
    totalTests: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Total Registered Students
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student')

        // 2. Active Subscriptions
        const { count: subCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .gt('expires_at', new Date().toISOString())

        // 3. Total Revenue
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
        
        const totalRev = payments?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0

        // 4. MCQ Tests Uploaded
        const { count: testCount } = await supabase
          .from('mcq_tests')
          .select('*', { count: 'exact', head: true })

        setStats({
          totalStudents: studentCount || 0,
          activeSubs: subCount || 0,
          totalRevenue: totalRev,
          totalTests: testCount || 0
        })

        // Fetch Recent Activity (Newest Profiles)
        const { data: recentProfiles } = await supabase
          .from('profiles')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(5)
        
        if (recentProfiles) setRecentActivity(recentProfiles)

      } catch (err) {
        console.error("Admin Dashboard Stats Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Aggregating Platform Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 md:p-10 max-w-[1600px] mx-auto">
      <header className="mb-8 md:mb-12">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-[2px] bg-blue-600 rounded-full" />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Management Overview</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">Platform Dashboard</h1>
        <p className="text-slate-500 text-base md:text-xl font-medium mt-3">Monitor registrations, revenue, and content in real-time.</p>
      </header>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
        <StatsCard 
          title="Total Students" 
          value={stats.totalStudents.toLocaleString()} 
          icon={Users} 
          color="bg-blue-50 text-blue-600"
          subtitle="Registered aspirants"
        />
        <StatsCard 
          title="Active Subs" 
          value={stats.activeSubs.toLocaleString()} 
          icon={Target} 
          color="bg-emerald-50 text-emerald-600"
          subtitle="Premium active plans"
        />
        <StatsCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={CreditCard} 
          color="bg-amber-50 text-amber-600"
          subtitle="Lifetime earnings"
        />
        <StatsCard 
          title="Tests Uploaded" 
          value={stats.totalTests.toLocaleString()} 
          icon={FileText} 
          color="bg-indigo-50 text-indigo-600"
          subtitle="Mock assessments live"
        />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-6 md:p-10 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-3">
              <History className="text-blue-600" />
              Recent Registrations
            </h3>
            <p className="text-xs md:text-sm font-medium text-slate-400 mt-1">Newly joined students across the platform</p>
          </div>
        </div>


        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined On</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentActivity.map((user, i) => (
                <tr key={i} className="group hover:bg-slate-50/30 transition-all duration-300">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      <span className="font-black text-slate-800 text-lg">{user.full_name || 'Anonymous User'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-slate-500 font-bold text-sm">{user.email || 'N/A'}</span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-slate-400 font-medium text-sm">{format(new Date(user.updated_at), 'MMM dd, yyyy')}</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {recentActivity.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No recent activity detected</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
