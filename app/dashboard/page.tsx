'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import Sidebar from '@/components/Sidebar'
import { UpgradeBanner } from '@/components/payment/UpgradeBanner'
import { 
  FileText, 
  LogOut, 
  Trophy, 
  Target, 
  History, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Bell,
  Activity,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Zap,
  Flame,
  CheckCircle,
  XCircle,
  BarChart4
} from 'lucide-react'
import { format, isSameDay, subDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import '@/components/DashboardOverview.css'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTests: 0,
    avgScore: 0,
    highestScore: 0,
    passCount: 0,
    failCount: 0,
    strongestSubject: 'N/A',
    weakestSubject: 'N/A',
    streak: 0,
    weeklyTests: 0
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [weakSubjectsList, setWeakSubjectsList] = useState<string[]>([])
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)

        const { data: resultsData, error } = await supabase
          .from('test_results')
          .select(`
            *,
            mcq_tests (
              title,
              subject
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (error) throw error

        if (resultsData && resultsData.length > 0) {
          setResults([...resultsData].reverse())
          
          const total = resultsData.length
          const avg = Math.round(resultsData.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0) / total)
          const highest = Math.max(...resultsData.map(r => Number(r.percentage) || 0))
          
          // Pass/Fail
          const passCount = resultsData.filter(r => (Number(r.percentage) || 0) >= 40).length
          const failCount = total - passCount

          // Subject Analysis
          const subjectAverages: Record<string, { total: number, count: number }> = {}
          resultsData.forEach(r => {
            const sub = r.mcq_tests?.subject || 'General'
            if (!subjectAverages[sub]) subjectAverages[sub] = { total: 0, count: 0 }
            subjectAverages[sub].total += (Number(r.percentage) || 0)
            subjectAverages[sub].count += 1
          })

          const subjectsWithAvg = Object.entries(subjectAverages).map(([name, data]) => ({
            name,
            avg: data.total / data.count
          }))

          const strongest = [...subjectsWithAvg].sort((a, b) => b.avg - a.avg)[0]?.name || 'N/A'
          const weakest = [...subjectsWithAvg].sort((a, b) => a.avg - b.avg)[0]?.name || 'N/A'
          
          // Streak Counter
          let streak = 0
          const dates = resultsData.map(r => new Date(r.created_at))
          let checkDate = new Date()
          
          while (true) {
            const hasTest = dates.some(d => isSameDay(d, checkDate))
            if (hasTest) {
              streak++
              checkDate = subDays(checkDate, 1)
            } else {
              break
            }
          }

          // Weekly Progress
          const now = new Date()
          const weekStart = startOfWeek(now, { weekStartsOn: 1 })
          const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
          const weeklyTests = resultsData.filter(r => 
            isWithinInterval(new Date(r.created_at), { start: weekStart, end: weekEnd })
          ).length

          setStats({
            totalTests: total,
            avgScore: avg,
            highestScore: highest,
            passCount,
            failCount,
            strongestSubject: strongest,
            weakestSubject: weakest,
            streak,
            weeklyTests
          })

          setChartData(resultsData.slice(-10).map(r => ({
            name: format(new Date(r.created_at), 'dd MMM'),
            score: Math.round(Number(r.percentage) || 0)
          })))

          setWeakSubjectsList(subjectsWithAvg.filter(s => s.avg < 60).map(s => s.name).slice(0, 3))
        }
      } catch (err) {
        console.error("Dashboard Error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  const passPercentage = stats.totalTests > 0 ? Math.round((stats.passCount / stats.totalTests) * 100) : 0
  const ratioData = [
    { name: 'Pass', value: stats.passCount, color: '#10b981' },
    { name: 'Fail', value: stats.failCount, color: '#ef4444' }
  ]

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      
      <div className="flex-1 md:ml-[280px] p-5 md:p-8 lg:p-12 transition-all space-y-8">
        <UpgradeBanner />
        {/* Header */}
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Performance Overview</h1>
            <p className="text-slate-500 text-base md:text-lg font-medium mt-1 italic">Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
          </div>

          
          <div className="flex items-center gap-4">
            <div className="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                <Flame size={20} fill="currentColor" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Day Streak</span>
                <span className="text-lg font-black text-slate-900">{stats.streak} Days</span>
              </div>
            </div>
            <button onClick={handleSignOut} className="p-4 bg-white text-slate-400 hover:text-red-600 rounded-2xl border border-slate-100 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-50 shadow-sm">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tests</p>
            <span className="text-2xl md:text-3xl font-black text-slate-900">{stats.totalTests}</span>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-50 shadow-sm">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Score</p>
            <span className="text-2xl md:text-3xl font-black text-emerald-600">{stats.avgScore}%</span>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-50 shadow-sm">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass Ratio</p>
            <span className="text-2xl md:text-3xl font-black text-blue-600">{passPercentage}%</span>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-50 shadow-sm">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Tests</p>
            <span className="text-2xl md:text-3xl font-black text-amber-600">{stats.weeklyTests}</span>
          </div>
        </div>


        {/* Advanced Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
            <h3 className="text-lg md:text-xl font-black text-slate-800 mb-6 md:mb-8 flex items-center gap-2">
              <BarChart4 className="text-blue-600" />
              Progression Curve
            </h3>
            <div className="h-[200px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pass/Fail Distribution */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col">
            <h3 className="text-lg md:text-xl font-black text-slate-800 mb-6 md:mb-8">Pass/Fail Ratio</h3>

            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratioData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ratioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-500">Pass: {stats.passCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs font-bold text-slate-500">Fail: {stats.failCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Focus Areas & Strengths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <Trophy size={32} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Strongest Subject</span>
              <span className="text-2xl font-black text-slate-900">{stats.strongestSubject}</span>
              <p className="text-xs font-medium text-emerald-600 mt-1">Excellent performance here!</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg flex items-center gap-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
              <AlertTriangle size={32} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Needs Attention</span>
              <span className="text-2xl font-black text-slate-900">{stats.weakestSubject}</span>
              <p className="text-xs font-medium text-red-600 mt-1">Lowest average score detected.</p>
            </div>
          </div>
        </div>

        {/* Improvement List */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-10">
          <div className="flex items-center gap-3 mb-8">
            <Lightbulb className="text-amber-500" />
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Improvement Checklist</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weakSubjectsList.length > 0 ? (
              weakSubjectsList.map((sub, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-100 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-black text-slate-900 uppercase text-xs tracking-widest">{sub}</span>
                    <Zap size={16} className="text-amber-500" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Accuracy in {sub} is low. Focus on core concepts and attempt at least 3 more mock tests this week.
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">You are doing great in all subjects!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
