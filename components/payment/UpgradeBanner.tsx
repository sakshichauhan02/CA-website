'use client';

import React, { useEffect, useState } from 'react';
import { Zap, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getUserSubscription } from '@/lib/subscription';

export const UpgradeBanner = () => {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const { hasPro } = getUserSubscription();
    setShow(!hasPro);
  }, []);

  if (!mounted || !show) return null;

  return (
    <div className="relative group">
      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
      
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-[2rem] p-1 shadow-xl">
        {/* Animated Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.4),transparent_50%)]" />
        </div>

        <div className="relative bg-white/5 backdrop-blur-sm px-6 md:px-10 py-5 rounded-[1.8rem] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-inner backdrop-blur-md">
              <Zap size={28} fill="currentColor" className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-amber-300" />
                <span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em]">Limited Time Offer</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Unlock all <span className="text-amber-300">Test Series, Notes and MCQs</span>
              </h2>
            </div>
          </div>

          <Link 
            href="/pricing"
            className="group/btn flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all active:scale-95 whitespace-nowrap"
          >
            Upgrade to Pro
            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
