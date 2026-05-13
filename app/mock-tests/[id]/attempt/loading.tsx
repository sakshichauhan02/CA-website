import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function AttemptLoading() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 w-6 h-6" />
        </div>
        <p className="text-lg font-bold text-slate-800 animate-pulse">Initializing Test Engine...</p>
      </div>
    </div>
  );
}
