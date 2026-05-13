'use client'

import React, { useState } from 'react'
import AuthLayout from '@/components/auth/AuthLayout'
import { forgotPassword } from '@/app/auth/actions'
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await forgotPassword(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      setSuccess(true)
      toast.success("Reset link sent!")
    }
  }

  if (success) {
    return (
      <AuthLayout title="Check your inbox" subtitle="If an account exists, you will receive a reset link.">
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <p className="text-slate-600 font-medium mb-8">We've sent a password reset link to your email address.</p>
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
          >
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Forgot Password?" subtitle="No worries, we'll send you reset instructions.">
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

        <button
          disabled={loading}
          type="submit"
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
        </button>

        <Link href="/login" className="flex items-center justify-center gap-2 text-slate-500 text-sm font-bold hover:text-slate-800 transition-colors">
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </form>
    </AuthLayout>
  )
}
