'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  RotateCcw, 
  BookOpen,
  Calendar,
  Clock,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';

interface ResultData {
  score: number;
  total: number;
  percentage: number;
  testTitle: string;
  results: Array<{
    questionId: number;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    }
  }>;
}

export default function TestResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    // Read from localStorage
    const savedResult = localStorage.getItem(`test_result_${id}`);
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    } else {
      // If no local data, we could redirect to the results history
      router.push('/my-results');
    }
  }, [id, router]);

  if (!result) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar />
        <div className="flex-1 md:ml-[280px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const isPassed = result.percentage >= 40;
  const attemptDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      
      <main className="flex-1 md:ml-[280px] p-6 lg:p-12 transition-all">
        <div className="max-w-5xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-10">
            <Link 
              href="/my-results"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
              Back to Results
            </Link>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/mock-tests"
                className="px-5 py-2.5 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                All Tests
              </Link>
              <Link 
                href={`/mock-tests/${id}/attempt`}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Retry Test
              </Link>
            </div>
          </div>

          {/* Simple Performance Card (NO CHARTS) */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-10 md:p-16 mb-12 relative overflow-hidden">
            {/* Simple Background Decoration */}
            <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`} />
            
            <div className="relative flex flex-col md:flex-row items-center gap-12">
              {/* Score Circle */}
              <div className={`relative w-48 h-48 rounded-full border-[12px] flex flex-col items-center justify-center shadow-inner ${
                isPassed ? 'border-emerald-500/10 text-emerald-600' : 'border-red-500/10 text-red-600'
              }`}>
                <span className="text-5xl font-black">{result.score}</span>
                <span className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">out of {result.total}</span>
              </div>

              {/* Stats & Badge */}
              <div className="text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                  <span className={`px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest border-2 ${
                    isPassed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {isPassed ? 'Passed' : 'Failed'}
                  </span>
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                    <Calendar size={16} />
                    {attemptDate}
                  </div>
                </div>
                
                <h1 className="text-4xl font-black text-slate-900 mb-2">{result.testTitle}</h1>
                <p className="text-slate-500 text-lg font-medium">
                  Your accuracy for this attempt was <span className={`font-black ${isPassed ? 'text-emerald-600' : 'text-red-500'}`}>{result.percentage}%</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-slate-900 px-2 flex items-center gap-3">
              <LayoutGrid className="text-blue-600" />
              Detailed Question Analysis
            </h2>

            {result.results.map((item, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 shadow-lg p-8 md:p-10">
                <div className="flex items-start gap-6">
                  {/* Question Number */}
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-lg ${
                    item.isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">
                      {item.questionText}
                    </h3>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(item.options).map(([key, text]) => {
                        const isUserAnswer = item.userAnswer?.trim().toLowerCase() === key.toLowerCase();
                        const isCorrectAnswer = item.correctAnswer?.trim().toLowerCase() === key.toLowerCase();
                        
                        let borderClass = "border-slate-100 bg-slate-50 text-slate-400";
                        if (isCorrectAnswer) borderClass = "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold";
                        else if (isUserAnswer && !item.isCorrect) borderClass = "border-red-500 bg-red-50 text-red-700 font-bold";

                        return (
                          <div key={key} className={`flex items-center p-5 rounded-2xl border-2 transition-all ${borderClass}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-xs font-black ${
                              isCorrectAnswer ? 'bg-emerald-500 text-white' : 
                              isUserAnswer ? 'bg-red-500 text-white' : 'bg-white text-slate-300'
                            }`}>
                              {key}
                            </div>
                            <span className="flex-1 text-sm">{text}</span>
                            {isCorrectAnswer && <CheckCircle2 size={18} className="text-emerald-500 ml-2" />}
                            {isUserAnswer && !item.isCorrect && <XCircle size={18} className="text-red-500 ml-2" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation - Only for incorrect questions or if exists */}
                    {item.explanation && (
                      <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
                        <BookOpen className="text-blue-600 shrink-0" size={20} />
                        <div>
                          <span className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Expert Explanation</span>
                          <p className="text-blue-800/80 font-medium text-sm leading-relaxed">{item.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Navigation */}
          <div className="mt-16 py-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-center gap-4">
            <Link 
              href="/mock-tests"
              className="px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            >
              Back to Mock Tests
            </Link>
            <Link 
              href={`/mock-tests/${id}/attempt`}
              className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
            >
              Retry This Test
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
