'use client'

import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Send,
  User,
  Calendar,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function AdminDoubtsPage() {
  const [loading, setLoading] = useState(true)
  const [doubts, setDoubts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [replyingTo, setReplyingTo] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const supabase = createClient()

  const fetchDoubts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('doubts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (filter === 'Answered') query = query.eq('is_answered', true)
      if (filter === 'Pending') query = query.eq('is_answered', false)
      if (search) query = query.ilike('question', `%${search}%`)

      const { data, error } = await query

      if (error) throw error
      if (data) setDoubts(data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load doubts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoubts()
  }, [filter, search])

  const handleReply = async () => {
    if (!replyText.trim()) return
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('doubts')
        .update({
          answer: replyText,
          is_answered: true,
          answered_at: new Date().toISOString()
        })
        .eq('id', replyingTo.id)

      if (error) throw error

      toast.success("Response sent successfully!")
      setDoubts(doubts.map(d => d.id === replyingTo.id ? { ...d, is_answered: true, answer: replyText } : d))
      setReplyingTo(null)
      setReplyText('')
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-10 max-w-[1600px] mx-auto min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Student Doubts</h1>
          <p className="text-slate-500 font-medium mt-1 italic">Answer questions and guide students through their learning journey.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          {['All', 'Pending', 'Answered'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Search Bar */}
      <div className="mb-10">
        <div className="relative max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search within questions..." 
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-600/5 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Doubts...</p>
        </div>
      ) : doubts.length === 0 ? (
        <div className="bg-white rounded-[3rem] border border-slate-100 p-20 text-center shadow-xl">
           <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
             <HelpCircle size={48} />
           </div>
           <h3 className="text-2xl font-black text-slate-900 mb-2">Inbox is Clean!</h3>
           <p className="text-slate-500 font-medium">No {filter !== 'All' ? filter.toLowerCase() : ''} doubts found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {doubts.map((doubt) => (
            <div key={doubt.id} className={`bg-white rounded-[2.5rem] border transition-all duration-300 ${doubt.is_answered ? 'border-slate-50 opacity-80' : 'border-blue-100 shadow-xl shadow-blue-600/5'}`}>
              <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8">
                {/* Left: Meta Info */}
                <div className="md:w-[250px] shrink-0 space-y-4">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                       <User size={20} />
                     </div>
                     <div>
                       <p className="font-black text-slate-900 leading-tight">{doubt.profiles?.full_name || 'Anonymous'}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate max-w-[150px]">{doubt.profiles?.email}</p>
                     </div>
                   </div>
                   <div className="flex flex-col gap-2">
                      <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100 self-start">
                        {doubt.subject}
                      </span>
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        <Calendar size={12} />
                        {format(new Date(doubt.created_at), 'dd MMM, yyyy')}
                      </div>
                   </div>
                   {doubt.is_answered ? (
                     <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                       <CheckCircle2 size={14} />
                       Answered
                     </div>
                   ) : (
                     <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-[0.2em] bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                       <Clock size={14} className="animate-pulse" />
                       Pending
                     </div>
                   )}
                </div>

                {/* Right: Question & Action */}
                <div className="flex-1 space-y-6">
                   <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative">
                     <div className="absolute -top-3 -left-3 w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-300 font-black italic">"</div>
                     <p className="text-slate-800 font-bold text-lg leading-relaxed">{doubt.question}</p>
                   </div>

                   {doubt.is_answered ? (
                      <div className="p-8 bg-emerald-50/30 rounded-[2rem] border border-emerald-50">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Send size={12} />
                          Admin Response
                        </p>
                        <p className="text-slate-700 font-medium italic">{doubt.answer}</p>
                      </div>
                   ) : (
                     <div className="space-y-4">
                       {replyingTo?.id === doubt.id ? (
                         <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <textarea 
                              rows={4}
                              className="w-full p-8 bg-blue-50/30 border-2 border-blue-100 rounded-[2rem] outline-none font-bold text-slate-800 placeholder:text-blue-200 focus:bg-white transition-all"
                              placeholder="Write your expert answer here..."
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                            ></textarea>
                            <div className="flex gap-3">
                              <button 
                                onClick={handleReply}
                                disabled={isSubmitting}
                                className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
                              >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                Submit Answer
                              </button>
                              <button 
                                onClick={() => setReplyingTo(null)}
                                className="px-8 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                         </div>
                       ) : (
                         <button 
                           onClick={() => {
                             setReplyingTo(doubt)
                             setReplyText('')
                           }}
                           className="flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-black rounded-2xl border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                         >
                           <MessageSquare size={18} />
                           Reply to Doubt
                         </button>
                       )}
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
