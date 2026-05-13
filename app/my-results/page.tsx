import React from 'react';
import Sidebar from '@/components/Sidebar';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { 
  BookOpen, 
  RotateCcw,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default async function MyResultsPage() {
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
          <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-[2px] bg-blue-600 rounded-full" />
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Academic History</span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">My Results</h1>
              <p className="text-slate-500 text-xl font-medium mt-3 max-w-lg">Track your previous mock test performance</p>
            </div>
            
            <Link 
              href="/mock-tests"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-800 font-bold rounded-2xl border border-slate-200 hover:border-blue-200 transition-all shadow-sm"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Mock Tests
            </Link>
          </header>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
            {results && results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Test Name</th>
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
                            <span className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                              {test?.title || 'CA Mock Assessment'}
                            </span>
                          </td>
                          <td className="px-10 py-10">
                            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
                              {test?.subject || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-10 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-black text-slate-900 text-2xl tracking-tighter">{item.total_score} <span className="text-slate-300 font-bold text-sm">/ {item.total_questions}</span></span>
                            </div>
                          </td>
                          <td className="px-6 py-10 text-center">
                            <span className={`font-black text-2xl tracking-tighter ${isPass ? 'text-emerald-600' : 'text-red-500'}`}>
                              {percentage}%
                            </span>
                          </td>
                          <td className="px-10 py-10 text-slate-600 font-bold text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-400" />
                              {date}
                            </div>
                          </td>
                          <td className="px-10 py-10 text-center">
                            {isPass ? (
                              <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                                PASS
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 px-5 py-2 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100">
                                FAIL
                              </div>
                            )}
                          </td>
                          <td className="px-10 py-10 text-right">
                            <div className="flex items-center justify-end gap-4">
                              <Link 
                                href={`/mock-tests/${item.test_id}/result`}
                                className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                              >
                                View Report
                              </Link>
                              <Link 
                                href={`/mock-tests/${item.test_id}/attempt`}
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200"
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
                <div className="w-32 h-32 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center mb-10">
                  <BookOpen size={56} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-4">No test attempts yet</h3>
                <Link 
                  href="/mock-tests"
                  className="px-14 py-6 bg-blue-600 text-white font-black text-lg rounded-[2.5rem] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200"
                >
                  Start Mock Test
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
