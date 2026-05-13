'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import dynamic from 'next/dynamic'
import { 
  FileText, 
  Lock, 
  Unlock, 
  Loader2, 
  Star, 
  ArrowLeft,
  CheckCircle2,
  Trophy,
  BookOpen
} from 'lucide-react'
import { toast } from 'sonner'
import { getUserSubscription } from '@/lib/subscription'
import { LockedContent } from '@/components/payment/LockedContent'

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false })

export default function TestPapersPage() {
  const [papers, setPapers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activePaper, setActivePaper] = useState<any>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [selfScore, setSelfScore] = useState('')
  const [isSavingScore, setIsSavingScore] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 1. Check local subscription (simulation)
      const { hasPro } = getUserSubscription()
      if (hasPro) {
        setIsSubscribed(true)
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle()
          
          setIsSubscribed(!!subData)
        }
      }

      // 2. Fetch Papers
      const { data: papersData, error: papersError } = await supabase
        .from('papers')
        .select('*')
        .order('created_at', { ascending: false })

      if (papersError) throw papersError
      setPapers(papersData || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveScore = async () => {
    if (!selfScore || isNaN(Number(selfScore))) {
      toast.error('Please enter a valid score')
      return
    }

    try {
      setIsSavingScore(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please login to save your score')
        return
      }

      const { error } = await supabase
        .from('written_results')
        .insert({
          user_id: user.id,
          paper_id: activePaper.id,
          self_score: parseInt(selfScore)
        })

      if (error) throw error

      toast.success('Score saved successfully!')
      setSelfScore('')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSavingScore(false)
    }
  }

  if (activePaper) {
    return (
      <div className="min-h-screen bg-white">
        <header className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <button 
            onClick={() => setActivePaper(null)}
            className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-all"
          >
            <ArrowLeft size={20} />
            Back to List
          </button>
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-900">{activePaper.title}</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{activePaper.subject} • {activePaper.marks} Marks</p>
          </div>
          <div className="w-24" /> {/* Spacer */}
        </header>

        <div className="max-w-5xl mx-auto py-10 px-6">
          <div className="mb-12">
            <PDFViewer file={activePaper.pdf_url} />
          </div>

          <div className="max-w-md mx-auto bg-slate-50 rounded-[2.5rem] border border-slate-200 p-10 text-center shadow-xl shadow-slate-100">
             <Trophy className="mx-auto text-amber-500 mb-6" size={48} />
             <h3 className="text-2xl font-black text-slate-900 mb-2">Self Assessment</h3>
             <p className="text-slate-500 font-medium mb-8 text-sm">Review your answers and record your score for performance tracking.</p>
             
             <div className="space-y-6">
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Your Score (Out of {activePaper.marks})</label>
                 <input 
                   type="number" 
                   className="w-full px-8 py-5 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-600/5 text-center text-2xl transition-all"
                   placeholder="00"
                   value={selfScore}
                   onChange={(e) => setSelfScore(e.target.value)}
                 />
               </div>
               <button 
                 onClick={handleSaveScore}
                 disabled={isSavingScore}
                 className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 {isSavingScore ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                 Save Score
               </button>
             </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-5 md:p-12">
      <header className="max-w-7xl mx-auto mb-10 md:mb-16">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="text-blue-600" size={18} />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Test Repository</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">Practice <span className="text-blue-600">Papers</span></h1>
        <p className="text-slate-500 text-sm md:text-base font-medium mt-3 max-w-2xl">Download previous year questions and mock test papers. Self-score your performance to track your growth.</p>
      </header>

      {loading ? (
        <div className="py-20 md:py-40 flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Paper Library...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

          {papers.map((paper) => {
            const isLocked = paper.is_premium && !isSubscribed
            
            return (
              <LockedContent 
                key={paper.id} 
                hasAccess={!isLocked} 
                minimal={true} 
                featureName="Premium Test Papers"
              >
                <div 
                  className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden h-full"
                >
                  <div className="p-8 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <FileText size={28} />
                      </div>
                      {paper.is_premium ? (
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                          <Unlock size={12} />
                          Premium
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                          <Star size={12} fill="currentColor" />
                          Free
                        </div>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{paper.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{paper.subject} • {paper.marks} Marks</p>
                    
                    {paper.description && (
                      <p className="text-slate-500 font-medium text-sm mb-8 line-clamp-2">
                        {paper.description}
                      </p>
                    )}

                    <div className="mt-auto">
                      <button 
                        onClick={() => setActivePaper(paper)}
                        className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                      >
                        <Unlock size={18} />
                        Attempt Paper
                      </button>
                    </div>
                  </div>
                </div>
              </LockedContent>
            )
          })}
        </div>
      )}
      
      {papers.length === 0 && !loading && (
        <div className="max-w-lg mx-auto py-40 text-center">
          <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <FileText size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">No Papers Found</h3>
          <p className="text-slate-500 font-medium mt-2">Check back soon for new practice materials.</p>
        </div>
      )}
    </div>
  )
}
