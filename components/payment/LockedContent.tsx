'use client';

import React from 'react';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface LockedContentProps {
  hasAccess: boolean;
  children: React.ReactNode;
  featureName?: string;
  minimal?: boolean;
}

export const LockedContent: React.FC<LockedContentProps> = ({ 
  hasAccess, 
  children, 
  featureName = "this feature",
  minimal = false
}) => {
  if (hasAccess) {
    return <>{children}</>;
  }

  if (minimal) {
    return (
      <div className="relative overflow-hidden group">
        <div className="filter blur-md opacity-40 pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-white/10 backdrop-blur-[1px] text-center">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-2 shadow-lg">
            <Lock size={18} />
          </div>
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Pro Feature</p>
          <Link 
            href="/pricing"
            className="px-4 py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-slate-200 bg-white shadow-xl min-h-[400px] flex flex-col">
      {/* Blurred Content Background */}
      <div className="absolute inset-0 filter blur-xl opacity-20 pointer-events-none select-none p-10 overflow-hidden">
        {children}
      </div>

      {/* Glassmorphism Paywall Overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-slate-50/10 backdrop-blur-[4px]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 text-center"
        >
          {/* Lock Icon with Glow */}
          <div className="relative mx-auto w-20 h-20 mb-8">
            <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative w-full h-full bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg">
              <Lock size={36} />
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
            Premium Access <span className="text-blue-600">Locked</span>
          </h3>
          
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Upgrade to the Pro Plan to unlock <span className="text-slate-900 font-bold">{featureName}</span> and accelerate your CA preparation journey.
          </p>

          <div className="space-y-4">
            <Link 
              href="/pricing"
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 group transition-all hover:bg-black hover:shadow-xl active:scale-95"
            >
              <Zap size={18} fill="currentColor" className="text-amber-400" />
              Upgrade to Pro
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Instant Activation • Secure Payment
            </p>
          </div>
        </motion.div>
      </div>

      {/* Fallback space for layout if children are not rendered or empty */}
      <div className="invisible p-10 pointer-events-none">
        {children}
      </div>
    </div>
  );
};
