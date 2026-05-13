'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  MoreHorizontal,
  Video,
  XCircle,
  ShieldCheck,
  Search,
  Filter,
  Download
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = () => {
      const data = localStorage.getItem('mentor_bookings')
      if (data) {
        setBookings(JSON.parse(data))
      }
      setLoading(false)
    }

    fetchBookings()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-100'
      case 'cancelled':
        return 'bg-rose-50 text-rose-600 border-rose-100'
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Calendar size={24} />
            </div>
            <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Session History</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-slate-500 text-lg font-medium mt-3">Track and manage your scheduled mentorship sessions.</p>
        </div>
        <Link 
          href="/mentoring"
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95 flex items-center gap-2"
        >
          Book New Session
          <ArrowRight size={18} />
        </Link>
      </header>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
            <Calendar size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">No active bookings</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
            You haven't scheduled any mentorship sessions yet. Connect with a CA mentor to accelerate your prep.
          </p>
          <Link 
            href="/mentoring"
            className="inline-flex items-center gap-2 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
          >
            Find a Mentor
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mentor</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Slot Time</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.map((booking, i) => (
                  <motion.tr 
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-slate-50/30 transition-all duration-300"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm">
                          <img src={booking.mentorImage} alt={booking.mentorName} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-black text-slate-900 text-lg">{booking.mentorName}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black border border-slate-100 uppercase tracking-widest">
                        {booking.subject || 'N/A'}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                          <Calendar size={14} className="text-blue-600" />
                          {booking.slot.split(' ')[0]}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs mt-1">
                          <Clock size={14} />
                          {booking.slot.split(' ').slice(1).join(' ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'Approved' ? (
                          <button 
                            onClick={() => {
                              if (booking.meetingLink) {
                                window.open(booking.meetingLink, '_blank')
                              } else {
                                alert('No meeting link provided yet.')
                              }
                            }}
                            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
                          >
                            <Video size={14} />
                            Join Session
                          </button>
                        ) : booking.status === 'Awaiting Student' ? (
                          <button 
                            onClick={() => confirmByStudent(booking.id)}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                          >
                            <CheckCircle2 size={14} />
                            Accept & Confirm
                          </button>
                        ) : (
                          <button 
                            disabled
                            className="px-6 py-3 bg-slate-100 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed flex items-center gap-2"
                          >
                            <Clock size={14} />
                            Awaiting Mentor
                          </button>
                        )}
                        <button className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                          <XCircle size={20} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
