'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Users, 
  Star, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  MessageSquare
} from 'lucide-react'
import { mentors } from '@/lib/mentors'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

export default function MentorProfilePage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [mentor, setMentor] = useState<any>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isBooking, setIsBooking] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('admin_mentors');
    const source = stored ? JSON.parse(stored) : mentors;
    const found = source.find((m: any) => m.id === id);
    if (found) {
      setMentor(found)
    }
  }, [id])

  if (!mentor) return null

  const handleConfirmBooking = () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot first')
      return
    }

    setIsBooking(true)
    
    // Simulate booking process
    setTimeout(() => {
      const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}')
      const studentName = userProfile.full_name || 'Premium Student'
      
      const newBooking = {
        id: `BOK-${Math.floor(Math.random() * 100000)}`,
        studentName: studentName,
        mentorName: mentor.name,
        mentorImage: mentor.image,
        subject: mentor.subjects[0],
        slot: selectedSlot,
        date: new Date().toISOString(),
        status: 'Pending' // Start as Pending for Admin to approve
      }

      // Save to localStorage
      const existingBookings = JSON.parse(localStorage.getItem('mentor_bookings') || '[]')
      localStorage.setItem('mentor_bookings', JSON.stringify([newBooking, ...existingBookings]))

      setIsBooking(false)
      setShowSuccess(true)

      // Redirect after delay
      setTimeout(() => {
        router.push('/my-bookings')
      }, 2000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header / Navigation */}
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <Link 
          href="/mentoring"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors group mb-10"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Mentors
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Profile Info */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm"
            >
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="relative shrink-0">
                  <div className="w-40 h-40 md:w-56 md:h-56 rounded-[3rem] overflow-hidden border-8 border-slate-50 shadow-2xl">
                    <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-emerald-500 text-white p-3 rounded-2xl shadow-xl border-4 border-white">
                    <ShieldCheck size={24} />
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">Verified Mentor</span>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                      <Star size={12} className="fill-amber-600" />
                      {mentor.rating} ({mentor.reviews} Reviews)
                    </div>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">{mentor.name}</h1>
                  <p className="text-lg font-bold text-slate-400 mb-6 uppercase tracking-widest">Chartered Accountant • {mentor.exp} Experience</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {mentor.subjects.map((sub: string) => (
                      <span key={sub} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black border border-slate-100">
                        {sub}
                      </span>
                    ))}
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">About Mentor</h4>
                    <p className="text-slate-600 font-medium leading-relaxed italic">
                      "{mentor.bio}"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Availability / Slots */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select Available Slot</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mentor.slots.map((slot: string) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 group ${
                      selectedSlot === slot 
                        ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-100 scale-105' 
                        : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                    }`}
                  >
                    <Clock size={18} className={selectedSlot === slot ? 'text-blue-600' : 'text-slate-400'} />
                    <span className={`text-xs font-black uppercase tracking-widest ${selectedSlot === slot ? 'text-blue-900' : 'text-slate-500'}`}>
                      {slot}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Booking Summary Card */}
          <div className="lg:col-span-4 sticky top-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 rounded-[3rem] p-8 md:p-10 text-white shadow-2xl shadow-slate-200"
            >
              <h3 className="text-xl font-black mb-8 uppercase tracking-widest border-b border-white/10 pb-6">Booking Summary</h3>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Mentor</span>
                  <span className="font-black text-sm">{mentor.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Session Type</span>
                  <span className="font-black text-sm">1-on-1 Private Call</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Duration</span>
                  <span className="font-black text-sm">45 Minutes</span>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Time Slot</span>
                  <span className={`font-black text-sm ${selectedSlot ? 'text-blue-400' : 'text-slate-600'}`}>
                    {selectedSlot || 'Not Selected'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={isBooking || showSuccess}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group ${
                  showSuccess 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white text-slate-900 hover:bg-blue-400 hover:text-white active:scale-95'
                } disabled:opacity-70`}
              >
                {isBooking ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Clock size={18} />
                    </motion.div>
                    Processing...
                  </>
                ) : showSuccess ? (
                  <>
                    <CheckCircle2 size={18} />
                    Booking Confirmed!
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="mt-8 flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                  Mentor plan active. No additional payment required for this session.
                </p>
              </div>
            </motion.div>

            <div className="mt-6 p-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Need help?</p>
              <button className="flex items-center justify-center gap-2 w-full text-slate-900 font-black text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors">
                <MessageSquare size={16} />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-12 text-center max-w-sm shadow-2xl"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Booking Success!</h2>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                Your 1-on-1 session with {mentor.name} has been scheduled. Check your email for details.
              </p>
              <div className="flex flex-col gap-3">
                 <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2 }}
                      className="h-full bg-emerald-500"
                    />
                 </div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Redirecting to My Bookings...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
