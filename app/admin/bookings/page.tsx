'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  Phone,
  MessageSquare,
  ShieldCheck,
  Video,
  ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchBookings = () => {
      const data = localStorage.getItem('mentor_bookings')
      if (data) {
        let list = JSON.parse(data)
        // AUTO-CLEANUP: If any link is Jitsi, reset it so user can add Google Meet
        let cleaned = false
        list = list.map((b: any) => {
          if (b.meetingLink && b.meetingLink.includes('jit.si')) {
            cleaned = true
            return { ...b, meetingLink: '', status: 'Pending' } // Reset to Pending so admin can re-approve with Google Meet
          }
          return b
        })
        
        if (cleaned) {
          localStorage.setItem('mentor_bookings', JSON.stringify(list))
          toast.info('Old Jitsi links have been removed for a fresh Google Meet start!')
        }
        setBookings(list)
      }
      setLoading(false)
    }
    fetchBookings()
  }, [])

  const updateStatus = (id: string, newStatus: string) => {
    let meetingLink = ''
    
    if (newStatus === 'Approved') {
      meetingLink = window.prompt('PASTE the Real Google Meet Link here (e.g. https://meet.google.com/xxx-yyyy-zzz):', '') || ''
      
      if (!meetingLink || !meetingLink.startsWith('https://meet.google.com/')) {
        toast.error('Please enter a valid Google Meet link starting with https://meet.google.com/')
        return
      }
    }

    const updated = bookings.map(b => b.id === id ? { 
      ...b, 
      status: newStatus, 
      meetingLink: meetingLink || b.meetingLink 
    } : b)
    
    setBookings(updated)
    localStorage.setItem('mentor_bookings', JSON.stringify(updated))
    toast.success(`Session ${newStatus === 'Approved' ? 'sent to student' : newStatus.toLowerCase()} successfully`)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100'
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100'
      default: return 'bg-slate-50 text-slate-600 border-slate-100'
    }
  }

  const filteredBookings = bookings.filter(b => 
    b.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.mentorName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return null

  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto min-h-screen">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Calendar size={24} />
          </div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Operations</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Session Requests</h1>
        <p className="text-slate-500 text-lg font-medium mt-3">Monitor and manage all 1-on-1 mentorship bookings across the platform.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Requests</p>
          <p className="text-2xl font-black text-slate-900">{bookings.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Pending Review</p>
          <p className="text-2xl font-black text-slate-900">{bookings.filter(b => b.status === 'Pending').length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Confirmed</p>
          <p className="text-2xl font-black text-slate-900">{bookings.filter(b => b.status === 'Approved').length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Revenue Generated</p>
          <p className="text-2xl font-black text-slate-900">₹{(bookings.length * 99).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by student or mentor name..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/10 outline-none font-medium text-sm text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
            <Filter size={18} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Mentor</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center text-slate-400 font-medium italic">
                    No session requests found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, i) => (
                  <tr key={booking.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-xs">
                          {(booking.studentName || 'Student').charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm leading-tight">{booking.studentName || 'Premium Student'}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <button className="text-slate-400 hover:text-indigo-600 transition-colors"><Mail size={12} /></button>
                             <button className="text-slate-400 hover:text-indigo-600 transition-colors"><MessageSquare size={12} /></button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100">
                          <img src={booking.mentorImage} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 text-xs">{booking.mentorName}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{booking.subject}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-slate-900 font-black text-[11px]">
                          <Calendar size={12} className="text-indigo-600" />
                          {booking.slot.split(' ')[0]}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] mt-1">
                          <Clock size={12} />
                          {booking.slot.split(' ').slice(1).join(' ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'Pending' ? (
                          <>
                            <button 
                              onClick={() => updateStatus(booking.id, 'Approved')}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
                            >
                              <CheckCircle2 size={12} />
                              Accept
                            </button>
                            <button 
                              onClick={() => updateStatus(booking.id, 'Cancelled')}
                              className="px-4 py-2 bg-white text-slate-400 border border-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95 flex items-center gap-2"
                            >
                              <XCircle size={12} />
                              Reject
                            </button>
                          </>
                        ) : booking.status === 'Approved' ? (
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => window.open(booking.meetingLink, '_blank')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
                              >
                                <Video size={12} />
                                Join Call
                              </button>
                              <button 
                                onClick={() => {
                                  window.open('https://meet.google.com/new', '_blank')
                                  const newLink = window.prompt('Paste new Google Meet link here:', booking.meetingLink)
                                  if (newLink) {
                                    const updated = bookings.map(b => b.id === booking.id ? { ...b, meetingLink: newLink } : b)
                                    setBookings(updated)
                                    localStorage.setItem('mentor_bookings', JSON.stringify(updated))
                                    toast.success('Meeting link updated to Google Meet!')
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                title="Change Meeting Link"
                              >
                                <ExternalLink size={16} />
                              </button>
                            </div>
                            <span className="text-[8px] font-bold text-slate-400 truncate max-w-[150px]">{booking.meetingLink}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Archived</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
