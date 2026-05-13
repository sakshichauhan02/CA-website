'use client'

import React, { useState } from 'react'
import { 
  ArrowLeft, 
  Save, 
  X, 
  Image as ImageIcon, 
  Users, 
  BookOpen, 
  Star, 
  Clock,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function NewMentorPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    subjects: '',
    bio: '',
    rating: '5.0',
    exp: '5+ Years',
    image: '',
    availability: 'Next Monday, 10:00 AM'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.subjects || !formData.bio) {
      toast.error('Please fill in all required fields')
      return
    }

    const newMentor = {
      ...formData,
      id: formData.name.toLowerCase().replace(/\s+/g, '-'),
      subjects: formData.subjects.split(',').map(s => s.trim()),
      reviews: 0,
      color: 'from-blue-600 to-indigo-600',
      slots: ['Mon 10:00 AM', 'Mon 02:00 PM', 'Wed 11:00 AM', 'Fri 05:00 PM']
    }

    // Save to localStorage
    const stored = localStorage.getItem('admin_mentors')
    const mentors = stored ? JSON.parse(stored) : []
    const updated = [newMentor, ...mentors]
    localStorage.setItem('admin_mentors', JSON.stringify(updated))

    toast.success('New mentor added successfully!')
    router.push('/admin/mentors')
  }

  return (
    <div className="p-8 md:p-12 max-w-[1000px] mx-auto min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link 
            href="/admin/mentors"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors group mb-4"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Onboard Faculty</h1>
          <p className="text-slate-500 text-lg font-medium mt-2">Add a new expert to the CA Mentor faculty network.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Info size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Basic Information</h3>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. CA Anjali Verma"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/10 outline-none font-bold text-slate-700"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expertise (Comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Direct Tax, Audit"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/10 outline-none font-bold text-slate-700"
                    value={formData.subjects}
                    onChange={e => setFormData({...formData, subjects: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Experience</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 10+ Years"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/10 outline-none font-bold text-slate-700"
                    value={formData.exp}
                    onChange={e => setFormData({...formData, exp: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Biography</label>
                <textarea 
                  rows={4}
                  placeholder="Brief overview of the mentor's qualifications and impact..."
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/10 outline-none font-bold text-slate-700 resize-none"
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/avatar.png"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/10 outline-none font-bold text-slate-700"
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                type="submit"
                className="flex-grow py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Confirm Onboarding
              </button>
              <button 
                type="button"
                onClick={() => router.push('/admin/mentors')}
                className="px-10 py-5 bg-white text-slate-400 rounded-[2rem] font-black text-xs uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Preview Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Live Card Preview</h4>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl overflow-hidden border border-white/20">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>
              <div>
                <p className="font-black text-lg">{formData.name || 'Mentor Name'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faculty Member</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex flex-wrap gap-2">
                {(formData.subjects ? formData.subjects.split(',') : ['Subject 1', 'Subject 2']).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-tight">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
              <ShieldCheck size={16} className="text-emerald-500" />
              <p className="text-[9px] font-bold text-slate-300 leading-relaxed uppercase tracking-widest">
                Card will be displayed in the premium Faculty directory.
              </p>
            </div>
          </div>

          <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
             <div className="flex items-center gap-3 mb-4">
                <Zap size={20} className="text-indigo-600" />
                <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest">Onboarding Tips</h4>
             </div>
             <ul className="space-y-3">
                <li className="text-[10px] font-bold text-indigo-600/70 leading-relaxed flex items-start gap-2">
                   <div className="w-1 h-1 bg-indigo-600 rounded-full mt-1.5 shrink-0" />
                   Use high-resolution portrait images for the best visual impact.
                </li>
                <li className="text-[10px] font-bold text-indigo-600/70 leading-relaxed flex items-start gap-2">
                   <div className="w-1 h-1 bg-indigo-600 rounded-full mt-1.5 shrink-0" />
                   List core subjects first to optimize for student search filters.
                </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
