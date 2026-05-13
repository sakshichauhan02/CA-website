'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  HelpCircle,
  Clock,
  BookOpen,
  Layout,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface Question {
  id: string
  text: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  explanation: string
}

export default function CreateNewTestPage() {
  const router = useRouter()
  const supabase = createClient()
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
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: crypto.randomUUID(),
      text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: ''
    }
  ])

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
        explanation: ''
      }
    ])
  }

  const deleteQuestion = (id: string) => {
    if (questions.length === 1) return
    setQuestions(questions.filter(q => q.id !== id))
  }

  const updateQuestion = (id: string, field: keyof Question, value: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  const handleSaveTest = async () => {
    if (!testInfo.title) {
      toast.error("Please enter a test title")
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Create the Test Header
      const { data: testData, error: testError } = await supabase
        .from('mcq_tests')
        .insert([{
          title: testInfo.title,
          subject: testInfo.subject,
          description: testInfo.description,
          time_limit: testInfo.duration,
          is_premium: testInfo.isPremium,
          difficulty: testInfo.difficulty,
          questions_count: questions.length
        }])
        .select()
        .single()

      if (testError) throw testError

      // 2. Create the Questions
      const questionsToInsert = questions.map(q => ({
        test_id: testData.id,
        question_text: q.text,
        option_a: q.optionA,
        option_b: q.optionB,
        option_c: q.optionC,
        option_d: q.optionD,
        correct_answer: q.correctAnswer,
        explanation: q.explanation
      }))

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (questionsError) throw questionsError

      toast.success("Mock Test created successfully!")
      router.push('/admin/mcq-management')
    } catch (err: any) {
      console.error("Save Test Error:", err)
      toast.error(err.message || "Failed to save test")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-10 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Mock Test</h1>
            <p className="text-slate-500 font-medium">Define test settings and populate with questions.</p>
          </div>
        </div>
        <button 
          onClick={handleSaveTest}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          Publish Test
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Left Column: Test Configuration */}
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
                  placeholder="e.g. CA Foundation Full Mock 2026"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10 transition-all"
                  value={testInfo.title}
                  onChange={e => setTestInfo({...testInfo, title: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subject</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10 transition-all appearance-none"
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
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="number" 
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10"
                      value={testInfo.duration}
                      onChange={e => setTestInfo({...testInfo, duration: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Difficulty</label>
                  <select 
                    className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10 appearance-none"
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
                  placeholder="Tell students what this test covers..."
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10 transition-all resize-none"
                  value={testInfo.description}
                  onChange={e => setTestInfo({...testInfo, description: e.target.value})}
                ></textarea>
              </div>

              <div className="flex items-center justify-between p-6 bg-blue-50 rounded-[2rem]">
                <div>
                  <p className="font-black text-blue-900 leading-tight">Premium Access</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Locked for Free users</p>
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

        {/* Right Column: Question Creator */}
        <div className="xl:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">Questions ({questions.length})</h3>
            <button 
              onClick={addQuestion}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-black rounded-2xl border border-blue-100 hover:bg-blue-50 transition-all shadow-sm"
            >
              <Plus size={18} />
              Add Question
            </button>
          </div>

          <div className="space-y-8">
            {questions.map((q, index) => (
              <div key={q.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                   <span className="w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center font-black shadow-sm">
                     {index + 1}
                   </span>
                   <button 
                    onClick={() => deleteQuestion(q.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
                
                <div className="p-8 space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Question Text</label>
                    <textarea 
                      placeholder="Write your question here..."
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10 transition-all"
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
                            placeholder={`Value for ${opt}`}
                            className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-xl outline-none font-bold text-slate-700"
                            value={q[`option${opt}` as keyof Question]}
                            onChange={e => updateQuestion(q.id, `option${opt}` as keyof Question, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-2">
                      <AlertCircle size={12} className="text-blue-500" />
                      Detailed Explanation
                    </label>
                    <textarea 
                      placeholder="Why is this answer correct? (Optional)"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10 transition-all"
                      value={q.explanation}
                      onChange={e => updateQuestion(q.id, 'explanation', e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={addQuestion}
            className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex flex-col items-center gap-2"
          >
            <Plus size={32} />
            Add Another Question to this Test
          </button>
        </div>
      </div>
    </div>
  )
}
