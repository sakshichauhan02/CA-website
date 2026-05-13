'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Star,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Download
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { mentors as initialMentors } from '@/lib/mentors'
import { toast } from 'sonner'

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadMentors = () => {
      const stored = localStorage.getItem('admin_mentors')
      if (stored) {
        setMentors(JSON.parse(stored))
      } else {
        // Initialize with default mentors if empty
        localStorage.setItem('admin_mentors', JSON.stringify(initialMentors))
        setMentors(initialMentors)
      }
      setLoading(false)
    }
    loadMentors()
  }, [])

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this mentor?')) {
      const updated = mentors.filter(m => m.id !== id)
      setMentors(updated)
      localStorage.setItem('admin_mentors', JSON.stringify(updated))
      toast.success('Mentor deleted successfully')
    }
  }

  const filteredMentors = mentors.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subjects.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return null

  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto min-h-screen">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Users size={24} />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Faculty Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Mentor Directory</h1>
          <p className="text-slate-500 text-lg font-medium mt-3">Manage your expert network and session availability.</p>
        </div>
        <Link 
          href="/admin/mentors/new"
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 flex items-center gap-2"
        >
          <Plus size={18} />
          Add New Mentor
        </Link>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Mentors</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{mentors.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Status</span>
          </div>
          <p className="text-3xl font-black text-slate-900">100%</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Star size={24} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Rating</span>
          </div>
          <p className="text-3xl font-black text-slate-900">4.9/5.0</p>
        </div>
      </div>

      {/* Table Controls */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search mentors by name or subject..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/10 outline-none font-medium text-sm text-slate-700 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
                <Filter size={18} />
             </button>
             <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
                <Download size={18} />
             </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mentor</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subjects</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMentors.map((mentor) => (
                <tr key={mentor.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                        <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg leading-tight">{mentor.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified CA</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                      {mentor.subjects.map((sub: string) => (
                        <span key={sub} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-tight border border-indigo-100">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full w-fit border border-amber-100">
                      <Star size={12} className="fill-amber-600" />
                      <span className="text-[10px] font-black">{mentor.rating}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-sm font-bold text-slate-500">{mentor.exp}</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/admin/mentors/edit/${mentor.id}`}
                        className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-100 hover:border-indigo-100 shadow-sm transition-all"
                      >
                        <Edit3 size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(mentor.id)}
                        className="p-3 bg-white text-slate-400 hover:text-red-600 rounded-xl border border-slate-100 hover:border-red-100 shadow-sm transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
