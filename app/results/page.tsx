import React from 'react';
import Sidebar from '@/components/Sidebar';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { 
  BookOpen, 
  RotateCcw,
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default async function ResultsHistoryPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar />
        <div className="flex-1 md:ml-[280px] flex items-center justify-center p-10">
          <div className="text-center bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl max-w-md">
            <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Login Required</h2>
            <p className="text-slate-500 font-medium mb-8">Please log in to your account to view your past mock test results and performance.</p>
            <Link href="/login" className="inline-block px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200">
              Log In Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: results, error } = await supabase
    .from('test_results')
    .select(`
      *,
      mcq_tests (
        title,
        subject
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      
      <main className="flex-1 md:ml-[280px] p-8 lg:p-14 transition-all">
        <div className="max-w-7xl mx-auto">
          {/* Professional Header Section */}
          <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="reveal-anim">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-[2px] bg-blue-600 rounded-full" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Academic History</span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">My Results</h1>
              <p className="text-slate-500 text-xl font-medium mt-3 max-w-lg">Track and review your previous mock test performance with detailed breakdowns.</p>
            </div>
            
            <Link 
              href="/mock-tests"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-800 font-bold rounded-2xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Mock Tests
            </Link>
          </header>

          {/* Table Container with Modern Styling */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden border-separate">
            {results && results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Test Assessment</th>
                      <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Subject</th>
                      <th className="px-6 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Score</th>
                      <th className="px-6 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Accuracy</th>
                      <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Date</th>
                      <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Status</th>
                      <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {results.map((item) => {
                      const test = item.mcq_tests;
                      const percentage = Math.round(Number(item.percentage) || 0);
                      const isPass = percentage >= 40;
                      const date = new Date(item.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      });

                      return (
                        <tr key={item.id} className="group hover:bg-slate-50/40 transition-all duration-300">
                          <td className="px-10 py-10">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors leading-tight">
                                {test?.title || 'CA Mock Assessment'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1.5">
                                <ExternalLink size={10} />
                                Test ID: #{item.test_id || '000'}
                              </span>
                            </div>
                          </td>
                          <td className="px-10 py-10">
                            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
                              {test?.subject || 'Accounting'}
                            </span>
                          </td>
                          <td className="px-6 py-10 text-center">
                            <div className="flex flex-col items-center">
                              <div className="flex items-baseline gap-1">
                                <span className="font-black text-slate-900 text-2xl tracking-tighter">{item.total_score}</span>
                                <span className="text-slate-300 font-bold text-sm">/ {item.total_questions}</span>
                              </div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">Raw Marks</span>
                            </div>
                          </td>
                          <td className="px-6 py-10 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <span className={`font-black text-2xl tracking-tighter ${isPass ? 'text-emerald-600' : 'text-red-500'}`}>
                                {percentage}%
                              </span>
                              <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                <div 
                                  className={`h-full transition-all duration-1000 ${isPass ? 'bg-emerald-500' : 'bg-red-500'}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-10">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                <Calendar size={14} className="text-slate-400" />
                                {date}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium mt-1">Attempt Completed</span>
                            </div>
                          </td>
                          <td className="px-10 py-10 text-center">
                            {isPass ? (
                              <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-[0.1em] rounded-full border border-emerald-200/50 shadow-sm shadow-emerald-100/50">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                PASS
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 px-5 py-2 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-[0.1em] rounded-full border border-red-200/50 shadow-sm shadow-red-100/50">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                FAIL
                              </div>
                            )}
                          </td>
                          <td className="px-10 py-10 text-right">
                            <div className="flex items-center justify-end gap-4">
                              <Link 
                                href={`/mock-tests/${item.test_id}/result`}
                                className="group/btn relative px-6 py-3 text-blue-600 font-black text-[10px] uppercase tracking-widest overflow-hidden"
                              >
                                <span className="relative z-10">View Report</span>
                                <div className="absolute inset-0 bg-blue-50 rounded-xl scale-95 group-hover/btn:scale-100 opacity-0 group-hover/btn:opacity-100 transition-all duration-300" />
                              </Link>
                              <Link 
                                href={`/mock-tests/${item.test_id}/attempt`}
                                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 hover:-translate-y-0.5 active:translate-y-0"
                              >
                                <RotateCcw size={14} />
                                Retry Test
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 px-10">
                <div className="w-32 h-32 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center mb-10 rotate-3 transition-transform hover:rotate-0 duration-500">
                  <BookOpen size={56} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-4">No test attempts yet</h3>
                <p className="text-slate-500 font-medium max-w-md text-center mb-12 text-lg">
                  Every expert was once a beginner. Start your first mock test to begin tracking your performance journey.
                </p>
                <Link 
                  href="/mock-tests"
                  className="px-14 py-6 bg-blue-600 text-white font-black text-lg rounded-[2.5rem] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 hover:-translate-y-1"
                >
                  Start Your First Mock Test
                </Link>
              </div>
            )}
          </div>

          <div className="mt-16 text-center pb-20">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">End of History</p>
          </div>
        </div>
      </main>
    </div>
  );
}
