'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  BookOpen, 
  Lock, 
  FileText, 
  ChevronRight, 
  Search,
  Filter,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { getUserSubscription } from '@/lib/subscription'
import { LockedContent } from '@/components/payment/LockedContent'
import { UpgradeBanner } from '@/components/payment/UpgradeBanner'

const subjects = [
// ... subjects
]

export default function NotesPage() {
  const [activeSubject, setActiveSubject] = useState<string | null>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSubscription, setHasSubscription] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // 1. Check local subscription (simulation)
        const { hasPro } = getUserSubscription()
        if (hasPro) {
          setHasSubscription(true)
        } else {
          // Fallback to DB
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: subscription } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .eq('status', 'active')
              .maybeSingle()
            if (subscription) setHasSubscription(true)
          }
        }

        // 3. Fetch Notes
        let query = supabase.from('notes').select('*')
        if (activeSubject) {
          query = query.eq('subject', activeSubject)
        }
        
        const { data: notesData, error } = await query.order('created_at', { ascending: false })
        if (error) throw error
        setNotes(notesData || [])

      } catch (error) {
        console.error('Error fetching notes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeSubject, supabase])

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 md:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                  Academic Library
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Study Notes & <span className="text-blue-600">Resources</span>
              </h1>
              <p className="text-slate-500 text-base md:text-lg font-medium mt-3 max-w-2xl">
                Access curated, high-quality notes across all CA subjects. Simplified concepts for your exam preparation.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 w-full md:w-auto">
              <div className="w-12 h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 shrink-0">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Repository Status</p>
                <p className="text-xs md:text-sm font-black text-slate-900">{notes.length} Files Available</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Filter Section */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-6 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
            <button
              onClick={() => setActiveSubject(null)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                activeSubject === null 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              All Subjects
            </button>
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                  activeSubject === subject 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        <UpgradeBanner />
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Curating your library...</p>
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {notes.map((note) => {
              const isLocked = note.is_premium && !hasSubscription
              
              return (
                <LockedContent 
                  key={note.id} 
                  hasAccess={!isLocked} 
                  minimal={true} 
                  featureName="Premium Notes"
                >
                  <div 
                    className="group bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 relative flex flex-col h-full overflow-hidden"
                  >
                    {/* Subject Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50/50 px-3 py-1 rounded-full border border-blue-100">
                        {note.subject}
                      </span>
                      {note.is_premium ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                          <Sparkles size={10} />
                          Premium
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                          Free
                        </span>
                      )}
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                        {note.title}
                      </h3>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-slate-400">
                          Chapter: <span className="text-slate-600">{note.chapter || 'Introduction'}</span>
                        </p>
                        <p className="text-xs font-bold text-slate-400">
                          Topic: <span className="text-slate-600">{note.topic || 'General'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                      <Link 
                        href={`/notes/${note.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-blue-600 text-blue-600 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-blue-600 transition-all group/btn shadow-sm hover:shadow-xl hover:shadow-blue-200"
                      >
                        Open Notes
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* Decorative Gradient */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/20 to-transparent -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700" />
                  </div>
                </LockedContent>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
              <Filter size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800">No notes found</h3>
            <p className="text-slate-400 font-medium mt-2">Try adjusting your filters or search criteria.</p>
            <button 
              onClick={() => setActiveSubject(null)}
              className="mt-8 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
