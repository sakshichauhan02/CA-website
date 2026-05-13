'use client'

import React, { useState } from 'react'
import { adminLogin } from '@/app/admin/auth-actions'
import { Loader2, Mail, Lock, Sparkles, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import '@/components/DashboardOverview.css'

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const result = await adminLogin(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <div className="dashboard-wrapper flex items-center justify-center p-6 bg-slate-900">
      {/* Dark Background Decor */}
      <div className="dashboard-bg-decor opacity-20">
        <div className="shape shape-1 !bg-blue-600/30" />
        <div className="shape shape-2 !bg-indigo-600/30" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] reveal-anim">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-500/20 mb-6">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">System Admin</h1>
          <p className="text-slate-400 font-medium mt-2 uppercase text-xs tracking-[0.2em]">Secure Entry Terminal</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="admin@camentor.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-600/20 transition-all outline-none font-medium text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-blue-600/20 transition-all outline-none font-medium text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-70 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Access Terminal
                  <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-10 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
          Restricted Access • CA Mentor Intranet
        </p>
      </div>
    </div>
  )
}
