'use client'

import React, { useState, Suspense } from 'react'
import AuthLayout from '@/components/auth/AuthLayout'
import { login } from '@/app/auth/actions'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const result = await login(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to your CA Mentor account to continue.">
      {message && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/20 transition-all outline-none font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
            <Link href="/forgot-password" size="sm" className="text-xs font-bold text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/20 transition-all outline-none font-medium text-slate-700"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-1">
           <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-600/20" />
           <label htmlFor="remember" className="text-sm font-medium text-slate-500">Remember me for 30 days</label>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Log In'}
        </button>

        <p className="text-center text-slate-500 text-sm font-medium mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>}>
      <LoginContent />
    </Suspense>
  )
}
