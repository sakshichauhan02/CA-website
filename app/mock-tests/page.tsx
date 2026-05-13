'use client'

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { createClient } from '@/utils/supabase/client';
import { 
  Search, 
  BookOpen, 
  Zap, 
  Lock, 
  Play, 
  Sparkles,
  Trophy,
  Filter,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { getUserSubscription } from '@/lib/subscription';
import { LockedContent } from '@/components/payment/LockedContent';
import { UpgradeBanner } from '@/components/payment/UpgradeBanner';

export default function MockTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Check local subscription (simulation)
        const { hasPro } = getUserSubscription();
        
        // 2. Fetch from DB if local is false
        if (hasPro) {
          setHasSubscription(true);
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: sub } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .eq('status', 'active')
              .maybeSingle();
            if (sub) setHasSubscription(true);
          }
        }

        // 3. Fetch Tests
        const { data: testsData } = await supabase
          .from('mcq_tests')
          .select('*, questions(count)')
          .order('created_at', { ascending: false });
        
        setTests(testsData || []);
      } catch (err) {
        console.error('Error fetching mock tests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(query.toLowerCase()) || 
                        test.subject.toLowerCase().includes(query.toLowerCase());
    const matchesSubject = !subjectFilter || test.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar />
        <div className="flex-1 md:ml-[280px] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      
      <div className="flex-1 md:ml-[280px] p-6 lg:p-10 transition-all space-y-8">
        <UpgradeBanner />
        {/* Header Section */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                  Assessment Portal
                </span>
                {hasSubscription && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 flex items-center gap-1">
                    <ShieldCheck size={10} />
                    Pro Member
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mock Test Series</h1>
              <p className="text-slate-500 text-lg font-medium mt-1">Excellence through consistent practice and analysis.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Tests</span>
                <span className="text-2xl font-black text-slate-800">{filteredTests.length}</span>
              </div>
              <div className="h-10 w-[1px] bg-slate-200 hidden lg:block mx-2" />
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Trophy className="text-amber-500" size={24} />
              </div>
            </div>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="mb-10">
          <div className="p-2 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by title, subject or topic..." 
                className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 text-slate-700 font-medium placeholder:text-slate-400 outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto pr-2">
              <select 
                className="bg-slate-50 text-slate-600 font-bold rounded-2xl px-4 py-3 border-none focus:ring-0 outline-none appearance-none cursor-pointer"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="">All Subjects</option>
                {["Accounting", "Auditing", "Law", "Tax", "Costing"].map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Test Grid */}
        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => {
              const qCount = test.questions?.[0]?.count || test.questions_count || 0;
              const isLocked = test.is_premium && !hasSubscription;
              
              return (
                <LockedContent 
                  key={test.id} 
                  hasAccess={!isLocked} 
                  minimal={true} 
                  featureName="Premium Mock Tests"
                >
                  <div 
                    className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-2">
                        <span className={`self-start px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          test.is_premium ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {test.is_premium ? 'Premium' : 'Free'}
                        </span>
                      </div>
                      <div className={`p-3 rounded-2xl ${isLocked ? 'bg-slate-50 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                        <Zap size={20} fill="currentColor" />
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                        {test.title}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                        <BookOpen size={14} />
                        {test.subject}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</span>
                        <span className="text-lg font-black text-slate-800">{qCount}</span>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</span>
                        <span className="text-lg font-black text-slate-800">{test.time_limit}m</span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Link 
                        href={`/mock-tests/${test.id}/attempt`}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                      >
                        Start Test Now
                        <Play size={16} fill="currentColor" className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </LockedContent>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <AlertCircle size={48} className="text-slate-300 mb-4" />
            <h3 className="text-2xl font-black text-slate-800 mb-2">No Mock Tests Found</h3>
            <p className="text-slate-500 font-medium text-center max-w-md">
              We couldn't find any tests matching your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
