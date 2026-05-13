'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  FileText, 
  BookOpen, 
  Clock, 
  Lock, 
  Zap, 
  Eye, 
  Edit3, 
  Trash2,
  Download,
  Loader2,
  Filter,
  ArrowRight
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function AdminNotesPage() {
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All Subjects')
  const supabase = createClient()

  const fetchNotes = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (subjectFilter !== 'All Subjects') {
        query = query.eq('subject', subjectFilter)
      }

      if (search) {
        query = query.ilike('title', `%${search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      if (data) setNotes(data)
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch notes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes()
    }, 400)
    return () => clearTimeout(timer)
  }, [search, subjectFilter])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete these notes?")) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success("Notes deleted successfully")
      setNotes(notes.filter(n => n.id !== id))
    } catch (err: any) {
      toast.error(err.message || "Deletion failed")
    }
  }

  return (
    <div className="p-10 max-w-[1600px] mx-auto min-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-[2px] bg-blue-600 rounded-full" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Study Library</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">Academic Notes</h1>
            <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Manage, publish, and organize PDF study materials.</p>
          </div>

          <Link 
            href="/admin/notes/new"
            className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:-translate-y-1"
          >
            <Plus size={22} />
            Upload New Notes
          </Link>
        </header>


        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
           {[
             { label: 'Total Files', val: notes.length, color: 'text-blue-600', bg: 'bg-blue-50' },
             { label: 'Accounting', val: notes.filter(n => n.subject === 'Accounting').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
             { label: 'Taxation', val: notes.filter(n => n.subject === 'Taxation').length, color: 'text-amber-600', bg: 'bg-amber-50' },
             { label: 'Audit/FM/Eco', val: notes.filter(n => ['Audit', 'FM', 'Economics'].includes(n.subject)).length, color: 'text-indigo-600', bg: 'bg-indigo-50' }
           ].map((stat, i) => (

             <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.val}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                   <BookOpen size={20} />
                </div>
             </div>
           ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 mb-8 flex flex-wrap items-center gap-4 md:gap-6">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by title..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-600/5 outline-none font-bold text-slate-700 transition-all text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="w-full md:w-auto px-8 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-600/5 cursor-pointer text-sm"
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
          >

            <option>All Subjects</option>
            <option>Accounting</option>
            <option>Law</option>
            <option>Taxation</option>
            <option>Costing</option>
            <option>Audit</option>
            <option>FM</option>
            <option>Economics</option>
          </select>

        </div>

        {/* List */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
          {loading ? (
             <div className="py-40 flex items-center justify-center">
               <Loader2 className="animate-spin text-blue-600" size={48} />
             </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Resource Details</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Chapter</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {notes.map((note) => (
                  <tr key={note.id} className="hover:bg-slate-50/40 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <FileText size={24} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg leading-tight">{note.title}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <Clock size={12} />
                            Added {format(new Date(note.created_at), 'dd MMM, yyyy')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
                        {note.subject}
                      </span>
                    </td>
                    <td className="px-10 py-8 font-bold text-slate-500">{note.chapter || 'Full Course'}</td>
                    <td className="px-10 py-8">
                      <div className="flex justify-center">
                        {note.is_premium ? (
                          <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                            <Lock size={12} />
                            Premium
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            <Zap size={12} fill="currentColor" />
                            Free
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3">
                        <a 
                          href={note.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 hover:bg-blue-50 rounded-xl text-blue-600 transition-all"
                        >
                          <Download size={20} />
                        </a>
                        <button 
                          onClick={() => handleDelete(note.id)}
                          className="p-3 hover:bg-red-50 rounded-xl text-red-500 transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {notes.length === 0 && !loading && (
            <div className="py-40 text-center flex flex-col items-center">
               <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center mb-8">
                 <BookOpen size={56} />
               </div>
               <h3 className="text-2xl font-black text-slate-800">No matching notes found</h3>
               <p className="text-slate-500 font-medium mt-1">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
    </div>
  )
}
