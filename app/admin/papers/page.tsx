'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  FileText, 
  ExternalLink,
  Trash2,
  Lock,
  Loader2,
  Filter,
  Edit3,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export default function AdminPapersPage() {
  const [loading, setLoading] = useState(true)
  const [papers, setPapers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10
  
  const supabase = createClient()

  // Modal States
  const [editingPaper, setEditingPaper] = useState<any>(null)
  const [deletingPaper, setDeletingPaper] = useState<any>(null)

  const fetchPapers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('papers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (search) {
        query = query.ilike('title', `%${search}%`)
      }

      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      const { data, count, error } = await query.range(from, to)

      if (error) throw error
      if (data) setPapers(data)
      if (count) setTotalCount(count)
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch papers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPapers()
    }, 500)
    return () => clearTimeout(timer)
  }, [search, currentPage])

  const handleDelete = async () => {
    if (!deletingPaper) return

    try {
      // 1. Extract path from URL (papers/filename.pdf)
      // URL format: .../storage/v1/object/public/papers/papers/filename.pdf
      const urlParts = deletingPaper.pdf_url.split('/papers/')
      const filePath = urlParts[urlParts.length - 1]

      // 2. Delete from Storage
      const { error: storageError } = await supabase.storage
        .from('papers')
        .remove([filePath])

      // 3. Delete from DB
      const { error: dbError } = await supabase
        .from('papers')
        .delete()
        .eq('id', deletingPaper.id)

      if (dbError) throw dbError

      toast.success("Paper and file deleted successfully")
      setPapers(papers.filter(p => p.id !== deletingPaper.id))
      setDeletingPaper(null)
    } catch (err: any) {
      toast.error(err.message || "Deletion failed")
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPaper) return

    try {
      const { error } = await supabase
        .from('papers')
        .update({
          title: editingPaper.title,
          subject: editingPaper.subject,
          marks: editingPaper.marks,
          description: editingPaper.description,
          is_premium: editingPaper.is_premium
        })
        .eq('id', editingPaper.id)

      if (error) throw error

      toast.success("Paper updated successfully")
      setPapers(papers.map(p => p.id === editingPaper.id ? editingPaper : p))
      setEditingPaper(null)
    } catch (err: any) {
      toast.error(err.message || "Update failed")
    }
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="p-10 max-w-[1600px] mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Test Papers</h1>
          <p className="text-slate-500 font-medium mt-1">Manage all uploaded PDF resources.</p>
        </div>
        <Link href="/admin/papers/new" className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
          <Plus size={20} />
          Upload New Paper
        </Link>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Papers</p>
            <span className="text-3xl font-black text-slate-900">{totalCount}</span>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Premium Papers</p>
            <span className="text-3xl font-black text-amber-500">{papers.filter(p => p.is_premium).length}</span>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recent Uploads</p>
            <span className="text-3xl font-black text-blue-600">{papers.slice(0,3).length}</span>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by title..." 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/10 outline-none font-bold text-slate-700"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          {loading ? (
             <div className="py-20 flex items-center justify-center">
               <Loader2 className="animate-spin text-blue-600" size={32} />
             </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Subject</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Marks</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Access</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {papers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-slate-50/30 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                          <FileText size={24} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">{paper.title}</p>
                          <p className="text-xs text-slate-400 font-bold mt-1">
                            Added {new Date(paper.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                        {paper.subject}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center font-black text-slate-700">{paper.marks}</td>
                    <td className="px-8 py-6 text-center">
                      {paper.is_premium ? (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                          <Lock size={10} />
                          Premium
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                          Free
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <a 
                          href={paper.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 hover:bg-blue-50 rounded-xl text-blue-600 transition-all"
                        >
                          <ExternalLink size={18} />
                        </a>
                        <button 
                          onClick={() => setEditingPaper(paper)}
                          className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => setDeletingPaper(paper)}
                          className="p-3 hover:bg-red-50 rounded-xl text-red-500 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <p className="text-sm font-bold text-slate-400">
             Showing <span className="text-slate-900">{papers.length}</span> of <span className="text-slate-900">{totalCount}</span> papers
           </p>
           <div className="flex gap-2">
             <button 
               disabled={currentPage === 1}
               onClick={() => setCurrentPage(p => p - 1)}
               className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-50 text-slate-600 hover:bg-slate-50 transition-all"
             >
               <ChevronLeft size={20} />
             </button>
             <button 
               disabled={currentPage === totalPages}
               onClick={() => setCurrentPage(p => p + 1)}
               className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-50 text-slate-600 hover:bg-slate-50 transition-all"
             >
               <ChevronRight size={20} />
             </button>
           </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPaper && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Edit Paper Details</h3>
              <button onClick={() => setEditingPaper(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
               <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Title</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none"
                  value={editingPaper.title}
                  onChange={e => setEditingPaper({...editingPaper, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subject</label>
                  <select 
                    className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none"
                    value={editingPaper.subject}
                    onChange={e => setEditingPaper({...editingPaper, subject: e.target.value})}
                  >
                    <option>Accounting</option>
                    <option>Auditing</option>
                    <option>Law</option>
                    <option>Taxation</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Marks</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none"
                    value={editingPaper.marks}
                    onChange={e => setEditingPaper({...editingPaper, marks: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                 <span className="font-bold text-slate-700">Premium Access</span>
                 <button 
                  type="button"
                  onClick={() => setEditingPaper({...editingPaper, is_premium: !editingPaper.is_premium})}
                  className={`w-14 h-8 rounded-full relative transition-all ${editingPaper.is_premium ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${editingPaper.is_premium ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <button className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                Update Paper
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPaper && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Delete this Paper?</h3>
            <p className="text-slate-500 font-medium mb-10">This will permanently remove <span className="font-bold text-slate-900">"{deletingPaper.title}"</span> from both your database and cloud storage.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeletingPaper(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-100"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
