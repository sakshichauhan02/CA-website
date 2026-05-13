'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Layout,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface Question {
  id: string | number
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation: string
  isNew?: boolean
}

export default function EditTestPage() {
  const router = useRouter()
  const { id } = useParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Test Info State
  const [testInfo, setTestInfo] = useState({
    title: '',
    subject: 'Accounting',
    description: '',
    duration: 60,
    isPremium: false,
    difficulty: 'Medium'
  })

  // Questions State
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        // 1. Fetch Test Details
        const { data: test, error: testError } = await supabase
          .from('mcq_tests')
          .select('*')
          .eq('id', id)
          .single()

        if (testError) throw testError

        setTestInfo({
          title: test.title,
          subject: test.subject,
          description: test.description || '',
          duration: test.time_limit,
          isPremium: test.is_premium,
          difficulty: test.difficulty
        })

        // 2. Fetch Questions
        const { data: qData, error: qError } = await supabase
          .from('questions')
          .select('*')
          .eq('test_id', id)
          .order('id', { ascending: true })

        if (qError) throw qError

        const mappedQuestions = qData.map(q => ({
          id: q.id,
          text: q.question_text || '',
          optionA: q.option_a || '',
          optionB: q.option_b || '',
          optionC: q.option_c || '',
          optionD: q.option_d || '',
          correctAnswer: q.correct_answer || 'A',
          explanation: q.explanation || ''
        }))

        setQuestions(mappedQuestions)
      } catch (err: any) {
        toast.error("Failed to load test data")
        router.push('/admin/mcq-management')
      } finally {
        setLoading(false)
      }
    }

    fetchTestData()
  }, [id, supabase, router])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        text: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        explanation: '',
        isNew: true
      }
    ])
  }

  const deleteQuestion = async (qId: string | number) => {
    if (questions.length === 1) return
    
    // If it's a real question in DB, we should handle deletion carefully
    // For now, we'll just remove from state and handle on Save
    setQuestions(questions.filter(q => q.id !== qId))
  }

  const updateQuestion = (qId: string | number, field: keyof Question, value: string) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, [field]: value } : q))
  }

  const handleUpdateTest = async () => {
    setIsSubmitting(true)
    try {
      // 1. Update Test Header
      const { error: testError } = await supabase
        .from('mcq_tests')
        .update({
          title: testInfo.title,
          subject: testInfo.subject,
          description: testInfo.description,
          time_limit: testInfo.duration,
          is_premium: testInfo.isPremium,
          difficulty: testInfo.difficulty,
          questions_count: questions.length
        })
        .eq('id', id)

      if (testError) throw testError

      // 2. Clear old questions and insert new ones (Simplest approach for sync)
      // Note: A more optimized way would be to diff them, but this ensures consistency.
      const { error: delError } = await supabase
        .from('questions')
        .delete()
        .eq('test_id', id)

      if (delError) throw delError

      const questionsToInsert = questions.map(q => ({
        test_id: id,
        question_text: q.text,
        option_a: q.optionA,
        option_b: q.optionB,
        option_c: q.optionC,
        option_d: q.optionD,
        correct_answer: q.correctAnswer,
        explanation: q.explanation
      }))

      const { error: insError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (insError) throw insError

      toast.success("Test updated successfully!")
      router.push('/admin/mcq-management')
    } catch (err: any) {
      toast.error(err.message || "Update failed")
    } finally {
      setIsSubmitting(false)
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
    <div className="p-10 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit Mock Test</h1>
            <p className="text-slate-500 font-medium">Update settings and modify questions.</p>
          </div>
        </div>
        <button 
          onClick={handleUpdateTest}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Layout className="text-blue-600" size={20} />
              Test Settings
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Test Title</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10"
                  value={testInfo.title}
                  onChange={e => setTestInfo({...testInfo, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subject</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10 appearance-none"
                  value={testInfo.subject}
                  onChange={e => setTestInfo({...testInfo, subject: e.target.value})}
                >
                  <option>Accounting</option>
                  <option>Auditing</option>
                  <option>Law</option>
                  <option>Taxation</option>
                  <option>Costing</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Duration (Min)</label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700"
                    value={testInfo.duration}
                    onChange={e => setTestInfo({...testInfo, duration: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Difficulty</label>
                  <select 
                    className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700"
                    value={testInfo.difficulty}
                    onChange={e => setTestInfo({...testInfo, difficulty: e.target.value})}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                <textarea 
                  rows={4}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10 resize-none"
                  value={testInfo.description}
                  onChange={e => setTestInfo({...testInfo, description: e.target.value})}
                ></textarea>
              </div>
              <div className="flex items-center justify-between p-6 bg-blue-50 rounded-[2rem]">
                <div>
                  <p className="font-black text-blue-900 leading-tight">Premium Access</p>
                </div>
                <button 
                  onClick={() => setTestInfo({...testInfo, isPremium: !testInfo.isPremium})}
                  className={`w-14 h-8 rounded-full relative transition-all ${testInfo.isPremium ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${testInfo.isPremium ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-8">
           <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">Questions ({questions.length})</h3>
            <button onClick={addQuestion} className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-black rounded-2xl border border-blue-100 hover:bg-blue-50 transition-all shadow-sm">
              <Plus size={18} />
              Add Question
            </button>
          </div>

          <div className="space-y-8">
            {questions.map((q, index) => (
              <div key={q.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                   <span className="w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center font-black shadow-sm">{index + 1}</span>
                   <button onClick={() => deleteQuestion(q.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                     <Trash2 size={20} />
                   </button>
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Question Text</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700"
                      value={q.text}
                      onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <div key={opt}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Option {opt}</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswer === opt}
                            onChange={() => updateQuestion(q.id, 'correctAnswer', opt)}
                            className="w-5 h-5 accent-blue-600"
                          />
                          <input 
                            type="text" 
                            className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-xl outline-none font-bold text-slate-700"
                            value={q[`option${opt}` as keyof Question]}
                            onChange={e => updateQuestion(q.id, `option${opt}` as keyof Question, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Detailed Explanation</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700"
                      value={q.explanation}
                      onChange={e => updateQuestion(q.id, 'explanation', e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
