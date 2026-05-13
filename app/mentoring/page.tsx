'use client'

import React, { useState, useEffect } from 'react'
import { 
  CheckCircle2, 
  Users, 
  MessageSquare, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Calendar,
  Lock,
  Star,
  Sparkles
} from 'lucide-react'
import { getUserSubscription } from '@/lib/subscription'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { mentors } from '@/lib/mentors'

export default function MentoringPage() {
  const [subscription, setSubscription] = useState({ hasPro: false, hasMentor: false });
  const [mounted, setMounted] = useState(false);

  const [mentorsList, setMentorsList] = useState<any[]>(mentors);

  useEffect(() => {
    setSubscription(getUserSubscription());
    setMounted(true);
    
    // Sync with admin data
    const stored = localStorage.getItem('admin_mentors');
    if (stored) {
      setMentorsList(JSON.parse(stored));
    }
  }, []);

  if (!mounted) return null;

  if (!subscription.hasMentor) {
    return <MentorPaywall />;
  }

  return (
    <div className="p-8 md:p-12 max-w-[1400px] mx-auto min-h-screen">
      <header className="mb-16">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Users size={24} />
          </div>
          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Mentor Access Active</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-4"
        >
          Select Your Guide
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed"
        >
          Direct 1-on-1 access to Chartered Accountants who have mastered the exam you're preparing for.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {mentorsList.map((mentor, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (i + 1) }}
            className="group relative"
          >
            {/* Hover Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${mentor.color} blur-2xl opacity-0 group-hover:opacity-10 transition-all duration-500 rounded-[3rem]`} />
            
            <div className="relative bg-white rounded-[3rem] p-2 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full">
               {/* Profile Image Container */}
               <div className="relative h-72 rounded-[2.5rem] overflow-hidden mb-6">
                  <img 
                    src={mentor.image} 
                    alt={mentor.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full flex items-center gap-1.5 shadow-xl">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black text-slate-900">{mentor.rating}</span>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md rounded-full">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Online Now</span>
                  </div>
               </div>

               {/* Mentor Info */}
               <div className="px-6 pb-6 flex flex-col flex-grow">
                 <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{mentor.name}</h3>
                 <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6">Chartered Accountant • {mentor.exp} Exp</p>
                 
                 <div className="flex flex-wrap gap-2 mb-8">
                   {mentor.subjects.map((sub, idx) => (
                     <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black border border-slate-100">
                       {sub}
                     </span>
                   ))}
                 </div>

                 <div className="mt-auto space-y-4">
                   <div className="flex items-center justify-between py-4 border-t border-slate-50">
                     <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-indigo-600" />
                        <span className="text-xs font-bold text-slate-500">Available:</span>
                     </div>
                     <span className="text-xs font-black text-slate-900">{mentor.availability}</span>
                   </div>

                   <div className="flex items-center gap-3">
                     <Link 
                        href={`/mentoring/${mentor.id}`}
                        className="flex-grow py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 group/btn"
                     >
                        Book Session
                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                     </Link>
                     <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-90">
                        <MessageSquare size={20} />
                     </button>
                   </div>
                 </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MentorPaywall() {
  const benefits = [
    {
      title: "1-on-1 CA Guidance",
      desc: "Personalized calls with top Chartered Accountants to solve your specific hurdles.",
      icon: Users,
      color: "text-blue-600 bg-blue-50"
    },
    {
      title: "Custom Study Roadmaps",
      desc: "Detailed study plans tailored to your strengths and weaknesses.",
      icon: Zap,
      color: "text-amber-600 bg-amber-50"
    },
    {
      title: "Priority Doubt Support",
      desc: "Get your complex academic doubts cleared within 4 hours via dedicated chat.",
      icon: MessageSquare,
      color: "text-indigo-600 bg-indigo-50"
    },
    {
      title: "Weekly Strategy Sessions",
      desc: "Exclusive live group sessions on time management and exam strategy.",
      icon: Sparkles,
      color: "text-emerald-600 bg-emerald-50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-20">
      <div className="max-w-6xl w-full">
        <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl shadow-indigo-200/50 overflow-hidden border border-slate-100 flex flex-col lg:flex-row">
          
          {/* Left Side: Illustration & Branding */}
          <div className="lg:w-[45%] bg-indigo-600 p-10 md:p-16 flex flex-col justify-between relative overflow-hidden">
            {/* Background Decorative Circles */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="w-16 h-1 bg-white/30 rounded-full mb-8" />
              <h2 className="text-white text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                Premium <br/>Personal <br/>Mentoring
              </h2>
              <p className="text-indigo-100 text-lg font-medium opacity-80 leading-relaxed max-w-sm">
                Don't just study hard, study smart with direct access to experts who have cleared the path before you.
              </p>
            </div>

            <div className="mt-12 relative z-10">
               <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem]">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl">
                        <ShieldCheck size={28} />
                     </div>
                     <div>
                        <p className="text-white font-black text-sm uppercase tracking-widest">Guaranteed Success</p>
                        <p className="text-indigo-200 text-xs font-bold">Trusted by 5000+ CA Aspirants</p>
                     </div>
                  </div>
                  <div className="flex -space-x-3">
                     {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center text-[10px] font-black text-white">
                           S{i}
                        </div>
                     ))}
                     <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">
                        +1K
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Side: Benefits & CTA */}
          <div className="lg:w-[55%] p-8 md:p-16 lg:p-20">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-indigo-100">
                <Lock size={12} />
                Unlock Professional Guidance
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Upgrade to Mentor Plan</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
              {benefits.map((b, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className={`w-12 h-12 ${b.color} rounded-2xl flex items-center justify-center`}>
                    <b.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-800 mb-1">{b.title}</h4>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">One-time Access</p>
                  <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-black text-slate-900">₹99</span>
                     <span className="text-slate-400 text-sm font-bold line-through">₹499</span>
                  </div>
               </div>
               <Link href="/pricing?plan=mentor" className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                  Buy Mentor Plan
                  <ArrowRight size={18} />
               </Link>
            </div>
            
            <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               100% Satisfaction Guarantee • No Hidden Costs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
