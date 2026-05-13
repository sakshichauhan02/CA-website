import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function MyResultsLoading() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      
      <div className="flex-1 md:ml-[280px] p-6 lg:p-10 transition-all">
        {/* Header Skeleton */}
        <header className="mb-10 animate-pulse">
          <div className="w-48 h-6 bg-slate-200 rounded-full mb-4" />
          <div className="w-96 h-10 bg-slate-300 rounded-2xl mb-2" />
          <div className="w-72 h-6 bg-slate-100 rounded-full" />
        </header>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 h-32" />
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden animate-pulse">
          <div className="h-16 bg-slate-50/50 w-full mb-2" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 border-b border-slate-50 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
