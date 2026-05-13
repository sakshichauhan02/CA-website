'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import '@/components/DashboardOverview.css'

export default function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
  return (
    <div className="dashboard-wrapper flex items-center justify-center p-6">
      {/* Background Decor */}
      <div className="dashboard-bg-decor">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="particle" style={{ top: '20%', left: '80%' }} />
        <div className="particle" style={{ top: '70%', left: '10%' }} />
      </div>

      <div className="relative z-10 w-full max-w-[480px] reveal-anim">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 mb-6">
            <Sparkles size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 font-medium mt-2">{subtitle}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          {children}
        </div>

        <p className="text-center mt-8 text-slate-400 text-sm font-medium">
          © {new Date().getFullYear()} CA Mentor. All rights reserved.
        </p>
      </div>
    </div>
  )
}
