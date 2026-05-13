'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Eye, 
  Edit3, 
  BookOpen,
  Loader2,
  Trash2,
  Zap,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import '@/components/admin/Admin.css'

const mcqTests = [
  { id: 1, title: 'CA Foundation - Accounts Full Mock', subject: 'Accounting', questions: 100, time: 180, premium: false, difficulty: 'Medium' },
  { id: 2, title: 'CA Inter - Taxation Group 1', subject: 'Taxation', questions: 60, time: 120, premium: true, difficulty: 'Hard' },
  { id: 3, title: 'Law & Ethics Unit Test 4', subject: 'Law', questions: 30, time: 45, premium: false, difficulty: 'Easy' },
  { id: 4, title: 'Direct Tax Laws - Part A', subject: 'Taxation', questions: 50, time: 90, premium: true, difficulty: 'Medium' },
]

import { createClient } from '@/utils/supabase/client'
import { format } from 'date-fns'

export default function AdminMCQPage() {
  const [loading, setLoading] = useState(true)
  const [tests, setTests] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('Tests')
  const supabase = createClient()

  React.useEffect(() => {
    const fetchTests = async () => {
      try {
        const { data, error } = await supabase
          .from('mcq_tests')
          .select('*')
          .order('created_at', { ascending: false })

        if (data) setTests(data)
      } catch (err) {
        console.error("Admin MCQ - Fetch Error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTests()
  }, [])

  const handleDeleteTest = async (id: number) => {
    if (!confirm("Are you sure you want to delete this test and all its questions?")) return

    try {
      const { error } = await supabase
        .from('mcq_tests')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success("Test deleted successfully")
      setTests(tests.filter(t => t.id !== id))
    } catch (err: any) {
      toast.error(err.message || "Failed to delete test")
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    )
  }
  return (
    <div className="p-10 max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">MCQ Management</h1>
            <p className="text-slate-500 font-medium mt-1">Design, organize, and publish MCQ assessments.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/admin/mcq/bulk"
              className="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Upload size={18} />
              Bulk CSV Upload
            </Link>
            <Link href="/admin/mcq/new" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              <Plus size={18} />
              Create New Test
            </Link>
          </div>
        </header>

        {/* Tab Selection */}
        <div className="flex gap-8 mb-8 border-b border-slate-100">
          {['Tests', 'Question Bank', 'Subject Tags'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${
                activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Filters and Table */}
        <div className="admin-table-container">
          <div className="p-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
             <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search tests by title or subject..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/10 outline-none font-medium text-slate-700"
              />
            </div>
            <div className="flex gap-3">
               <select className="px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 outline-none">
                <option>Filter Difficulty</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Assessment Details</th>
                <th>Subject</th>
                <th>Structure</th>
                <th>Access</th>
                <th>Difficulty</th>
                <th className="text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <span className="font-black text-slate-800">{test.title}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-slate-400" />
                      <span className="font-bold text-slate-600">{test.subject}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-800">{test.questions_count} Questions</span>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        <Clock size={10} />
                        {test.time_limit} Minutes
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {test.is_premium ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                          <Lock size={10} />
                          Premium
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                          <Zap size={10} fill="currentColor" />
                          Free
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                     <span className={`admin-badge ${
                      test.difficulty === 'Hard' ? 'badge-danger' : 
                      test.difficulty === 'Medium' ? 'badge-info' : 'badge-success'
                    }`}>
                      {test.difficulty}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/admin/mcq/bulk/${test.id}`}
                        title="Bulk Upload Questions" 
                        className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                      >
                        <Upload size={18} />
                      </Link>
                      <Link 
                        href={`/admin/mcq/edit/${test.id}`}
                        title="Edit Content" 
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                      >
                        <Edit3 size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDeleteTest(test.id)}
                        title="Delete Test" 
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400 font-bold">
                    No mock tests found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="p-8 bg-blue-600 rounded-b-2xl flex items-center justify-between">
             <div className="flex items-center gap-4 text-white">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                 <Sparkles size={24} />
               </div>
               <div>
                 <p className="text-lg font-black leading-tight">AI Test Generator</p>
                 <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Generate tests automatically from topics</p>
               </div>
             </div>
             <button className="px-6 py-3 bg-white text-blue-600 font-black rounded-xl hover:bg-slate-100 transition-all shadow-xl">
               Launch Generator
             </button>
          </div>
        </div>
    </div>
  )
}
