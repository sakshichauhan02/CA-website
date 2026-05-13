'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  MessageSquare, 
  Send, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

const subjects = [
  'Accounting', 'Law', 'Taxation', 'Costing', 'Audit', 'FM', 'Economics'
]

export default function DoubtsPage() {
  const [doubts, setDoubts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    subject: 'Accounting',
    question: ''
  })

  useEffect(() => {
    fetchDoubts()
  }, [])

  const fetchDoubts = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('doubts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDoubts(data || [])
    } catch (error: any) {
      console.error('Fetch Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.question.trim()) return

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      toast.success('Your doubt has been submitted!')
      setFormData({ ...formData, question: '' })
      fetchDoubts()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 md:mb-10 text-center px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <HelpCircle className="text-blue-600" size={18} />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Student Support</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">Ask Your <span className="text-blue-600">Doubts</span></h1>
          <p className="text-slate-500 text-sm md:text-base font-medium mt-3 max-w-2xl mx-auto">Get expert answers to your toughest CA questions within 24 hours.</p>
        </header>

        {/* Question Form */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-6 md:p-10 mb-8 md:mb-12">

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Subject</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-600/5 appearance-none cursor-pointer"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                >
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Your Question</label>
                <textarea 
                  required
                  placeholder="Explain your doubt in detail..."
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-600/5 transition-all min-h-[120px] resize-none"
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                Submit Question
              </button>
            </div>
          </form>
        </div>

        {/* Doubts History */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-8">
            <MessageSquare className="text-blue-600" />
            Your History
          </h2>

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving your queries...</p>
            </div>
          ) : doubts.length > 0 ? (
            doubts.map((doubt) => (
              <div 
                key={doubt.id}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                      {doubt.subject}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock size={12} />
                      {format(new Date(doubt.created_at), 'dd MMM, hh:mm a')}
                    </span>
                  </div>
                  
                  <p className="text-lg font-bold text-slate-800 leading-relaxed">
                    {doubt.question}
                  </p>

                  {doubt.is_answered ? (
                    <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={40} className="text-emerald-600" />
                      </div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <CheckCircle2 size={14} />
                        Admin Answer
                      </p>
                      <p className="text-slate-700 font-bold leading-relaxed">
                        {doubt.answer}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl w-fit border border-amber-100">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Pending Expert Review</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800">No questions yet</h3>
              <p className="text-slate-400 font-medium mt-2">Submit your first doubt using the form above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
