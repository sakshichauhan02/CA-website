'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import dynamic from 'next/dynamic'
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false })

import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Download,
  Share2,
  Bookmark
} from 'lucide-react'
import Link from 'next/link'

export default function NoteViewerPage() {
  const { id } = useParams()
  const router = useRouter()
  const [note, setNote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true)
        
        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        // 2. Fetch Note Details
        const { data: noteData, error: noteError } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .single()

        if (noteError || !noteData) {
          throw new Error('Note not found')
        }

        // 3. Check access if premium
        if (noteData.is_premium) {
          if (!user) {
            router.push('/login')
            return
          }

          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

          if (!subscription || subscription.status !== 'active') {
            setError('Premium subscription required to access these notes.')
            setLoading(false)
            return
          }
        }

        setNote(noteData)
      } catch (err: any) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchNote()
  }, [id, supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Opening Academic Resource...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-500 text-center max-w-md mb-8 font-medium">{error}</p>
        <Link 
          href="/notes"
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-xl shadow-slate-200"
        >
          Back to Library
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Viewer Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/notes"
              className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none">{note.title}</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                {note.subject} • {note.chapter || 'Section Overview'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex w-10 h-10 bg-white rounded-xl items-center justify-center text-slate-400 hover:text-blue-600 border border-slate-100 transition-all">
              <Share2 size={18} />
            </button>
            <button className="hidden sm:flex w-10 h-10 bg-white rounded-xl items-center justify-center text-slate-400 hover:text-blue-600 border border-slate-100 transition-all">
              <Bookmark size={18} />
            </button>
            <a 
              href={note.file_url} 
              download
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Download size={14} />
              Download PDF
            </a>
          </div>
        </div>
      </header>

      {/* PDF Container */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-center">
          <PDFViewer file={note.file_url} />
        </div>
      </div>
    </div>
  )
}
