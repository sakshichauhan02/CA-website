'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Smartphone, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: {
    name: string
    price: string
    type: string
  } | null
}

export default function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
  const [method, setMethod] = useState<'upi' | 'card'>('upi')
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  if (!plan) return null

  const handleSimulatePayment = () => {
    setIsProcessing(true)
    
    // Simulate network delay
    setTimeout(() => {
      // Save to localStorage as requested
      localStorage.setItem('active_subscription', JSON.stringify({
        plan_type: plan.type,
        status: 'active',
        activated_at: new Date().toISOString()
      }))

      setIsProcessing(false)
      toast.success(`Payment Successful! Welcome to ${plan.name}`, {
        description: 'Your premium features have been unlocked.',
        duration: 5000,
      })
      
      onClose()
      router.push('/dashboard')
    }, 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-none mb-1">Secure Checkout</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction ID: #CA-{Math.floor(Math.random() * 1000000)}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Order Summary */}
              <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-tight">Selected Plan</span>
                  <span className="text-sm font-black text-blue-600">{plan.name}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-medium text-slate-400">Total Payable Amount</span>
                  <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4 mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Choose Payment Method</p>
                
                {/* UPI Option */}
                <button
                  onClick={() => setMethod('upi')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    method === 'upi' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method === 'upi' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Smartphone size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-800">UPI / Google Pay / PhonePe</p>
                    <p className="text-xs font-medium text-slate-400">Pay via any UPI app</p>
                  </div>
                  {method === 'upi' && <CheckCircle2 className="ml-auto text-blue-600" size={20} />}
                </button>

                {/* Card Option */}
                <button
                  onClick={() => setMethod('card')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    method === 'card' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method === 'card' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <CreditCard size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-800">Credit / Debit Card</p>
                    <p className="text-xs font-medium text-slate-400">Visa, Mastercard, RuPay</p>
                  </div>
                  {method === 'card' && <CheckCircle2 className="ml-auto text-blue-600" size={20} />}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Simulate Successful Payment
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  Cancel Transaction
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End-to-End Encrypted Payment</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
