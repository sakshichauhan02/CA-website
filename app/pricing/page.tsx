'use client'

import React, { useEffect, useState } from 'react'
import { Check, Zap, Star, Shield, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import PaymentModal from '@/components/payment/PaymentModal'
import { getUserSubscription } from '@/lib/subscription'

const pricingPlans = [
  {
    name: 'Free Plan',
    price: '₹0',
    type: 'free',
    description: 'Start your journey with basic resources.',
    features: [
      'Dashboard Access',
      'Limited Mock Tests',
      'Study Planner',
      'Doubts Section'
    ],
    gradient: 'from-slate-500 to-slate-800',
    icon: Shield,
    popular: false,
  },
  {
    name: 'Pro Plan',
    price: '₹499',
    type: 'pro',
    description: 'Everything you need to crack CA.',
    features: [
      'All Test Series',
      'All Notes Access',
      'Unlimited MCQ Tests',
      'Performance Analytics'
    ],
    gradient: 'from-blue-600 to-indigo-800',
    icon: Zap,
    popular: true,
  },
  {
    name: 'Mentor Plan',
    price: '₹99',
    type: 'mentor',
    description: 'Personalized guidance from experts.',
    features: [
      '1-on-1 Mentoring',
      'Mentor Booking',
      'Priority Doubt Solving',
      'Custom Strategy Sessions'
    ],
    gradient: 'from-purple-600 to-fuchsia-800',
    icon: Star,
    popular: false,
  }
]

import { useSearchParams } from 'next/navigation'

import { Suspense } from 'react'

function PricingContent() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser(authUser)
          
          const { hasPro, hasMentor } = getUserSubscription()
          if (hasPro || hasMentor) {
            const localSub = localStorage.getItem('active_subscription')
            if (localSub) {
              setSubscription(JSON.parse(localSub))
              setLoading(false)
              return
            }
          }

          const { data: sub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', authUser.id)
            .eq('status', 'active')
            .maybeSingle()
          
          setSubscription(sub)
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
      } finally {
        setLoading(false)
        
        // Auto-open modal if plan is in query params
        const planType = searchParams.get('plan')
        if (planType) {
          const plan = pricingPlans.find(p => p.type === planType)
          if (plan) {
            setSelectedPlan(plan)
            setIsModalOpen(true)
          }
        }
      }
    }
    checkUser()
  }, [supabase, searchParams])

  const handleBuyNow = (plan: any) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  const isCurrentPlan = (planType: string) => {
    if (!subscription && planType === 'free') return true
    return subscription?.plan_type === planType
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <div className="w-12 h-[2px] bg-blue-600 rounded-full" />
            <span className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">Pricing Plans</span>
            <div className="w-12 h-[2px] bg-blue-600 rounded-full" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight"
          >
            Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Future Success</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium"
          >
            Choose the perfect plan to accelerate your CA preparation journey with AI-powered insights and expert guidance.
          </motion.p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              whileHover={{ y: -10 }}
              className={`relative bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col h-full ${
                plan.popular ? 'ring-2 ring-blue-600 ring-offset-4 ring-offset-[#f8fafc]' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-8 right-[-35px] bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-10 rotate-45 shadow-lg">
                  Most Popular
                </div>
              )}

              {/* Icon & Plan Name */}
              <div className="mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-white mb-6 shadow-xl`}>
                  <plan.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm font-medium">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">{plan.price}</span>
                  <span className="text-slate-400 font-bold">/lifetime</span>
                </div>
              </div>

              {/* Status Badge */}
              {isCurrentPlan(plan.type) && (
                <div className="mb-6 py-2 px-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Your Current Plan</span>
                </div>
              )}

              {/* Features */}
              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Check size={14} className="text-blue-600 font-bold" />
                    </div>
                    <span className="text-sm font-bold text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => !isCurrentPlan(plan.type) && handleBuyNow(plan)}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 group ${
                  isCurrentPlan(plan.type)
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : `bg-gradient-to-r ${plan.gradient} text-white shadow-lg hover:shadow-2xl hover:scale-[1.02]`
                }`}
              >
                {isCurrentPlan(plan.type) ? 'Plan Active' : 'Buy Now'}
                {!isCurrentPlan(plan.type) && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16 text-slate-400 text-sm font-bold uppercase tracking-widest"
        >
          Secure checkout powered by Razorpay. No recurring charges.
        </motion.p>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        plan={selectedPlan}
      />
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}
