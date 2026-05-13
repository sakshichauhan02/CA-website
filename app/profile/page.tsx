"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Brain, 
  BarChart3, 
  User, 
  ChevronLeft, 
  Calendar,
  Award,
  ArrowRight,
  TrendingUp,
  Mail,
  Loader2,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import TrendChart from '@/components/TrendChart'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // 1. Get the logged-in user
        const { data: { user: authUser } } = await supabase.auth.getUser()
        console.log("User:", authUser)
        
        if (authUser) {
          setUser(authUser)
          // 2. Fetch all test results for the user
          const { data, error } = await supabase
            .from('test_results')
            .select('*')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })
          
          console.log("Results:", data)
          if (error) throw error
          if (data) {
            setResults(data)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Please login to view your profile</h2>
          <Button asChild rounded-xl>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Format data for the trend chart (needs chronological order)
  const trendData = [...results].reverse().map(r => ({
    date: format(new Date(r.created_at), 'MMM dd'),
    score: r.total_score
  }))

  return (
    <div className="flex min-h-screen bg-muted/30">
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Button variant="ghost" asChild className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
                <Link href="/dashboard">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Student Profile</h1>
              <p className="text-muted-foreground mt-1">Review your journey and test performances.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-[2rem] bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20 rotate-3">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white truncate w-full px-2">CA Aspirant</h2>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest">
                    <Award className="h-3 w-3" />
                    Level: Foundation
                  </div>
                </div>

                <div className="mt-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shrink-0">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 leading-none mb-1">Email</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{user.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shrink-0">
                      <Calendar className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 leading-none mb-1">Joined</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {format(new Date(user.created_at), 'MMM yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Trend and Table */}
            <div className="lg:col-span-2 space-y-8">
              {/* Trend Chart (if results exist) */}
              {results.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Learning Trend</h3>
                      <p className="text-sm text-slate-500 font-medium">Your score progression</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </div>
                  <TrendChart data={trendData} />
                </div>
              )}

              {/* Results Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Test History</h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{results.length} Tests</span>
                </div>
                
                {results.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Total Score</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {results.map((result) => (
                          <tr key={result.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {format(new Date(result.created_at), 'MMMM dd, yyyy')}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {format(new Date(result.created_at), 'hh:mm a')}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-lg border-2 border-slate-200 dark:border-slate-700">
                                {result.total_score}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <Button variant="ghost" asChild className="rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Link href="/results" className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                                  View
                                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <Brain className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No test history yet</h3>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">Complete a mock test to see your performance analysis here.</p>
                    <Button asChild className="rounded-2xl px-8 py-6">
                      <Link href="/mock-tests">Take a Mock Test</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
