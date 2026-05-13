'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Circle,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Trash2
} from 'lucide-react'
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  eachDayOfInterval, 
  endOfWeek 
} from 'date-fns'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

const subjects = [
  'Accounting', 'Law', 'Taxation', 'Costing', 'Audit', 'FM', 'Economics'
]

export default function StudyPlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  // Form State
  const [formData, setFormData] = useState({
    subject: 'Accounting',
    description: '',
    duration: '1',
    date: format(new Date(), 'yyyy-MM-dd')
  })

  // Get current week days
  const start = startOfWeek(currentDate, { weekStartsOn: 1 })
  const end = endOfWeek(currentDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })

  useEffect(() => {
    fetchPlans()
  }, [currentDate])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'))

      if (error) throw error
      setPlans(data || [])
    } catch (error: any) {
      console.error('Fetch Error:', error)
      toast.error('Failed to load study plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePlan = async (date: string, updatedTasks: any[]) => {
    try {
      const response = await fetch('/api/study-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, tasks: updatedTasks })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to save')
      
      fetchPlans()
      return true
    } catch (error: any) {
      toast.error(error.message)
      return false
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const existingPlan = plans.find(p => p.date === formData.date)
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      subject: formData.subject,
      description: formData.description,
      duration: formData.duration,
      is_completed: false,
      created_at: new Date().toISOString()
    }

    const updatedTasks = existingPlan 
      ? [...existingPlan.tasks, newTask]
      : [newTask]

    const success = await handleSavePlan(formData.date, updatedTasks)
    
    if (success) {
      toast.success('Task scheduled successfully')
      setIsModalOpen(false)
      setFormData({ ...formData, description: '' })
    }
    setIsSubmitting(false)
  }

  const toggleTask = async (date: string, taskId: string) => {
    const plan = plans.find(p => p.date === date)
    if (!plan) return

    const updatedTasks = plan.tasks.map((t: any) => 
      t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
    )

    await handleSavePlan(date, updatedTasks)
  }

  const deleteTask = async (date: string, taskId: string) => {
    const plan = plans.find(p => p.date === date)
    if (!plan) return

    const updatedTasks = plan.tasks.filter((t: any) => t.id !== taskId)
    await handleSavePlan(date, updatedTasks)
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-blue-600" size={18} />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Productivity Engine</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">Study Planner</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Organize your week and crush your CA goals.</p>
        </div>


        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-2xl border border-slate-200 shadow-sm p-1">
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 text-sm font-black text-slate-700 uppercase tracking-widest">
              {format(start, 'MMM dd')} - {format(end, 'MMM dd')}
            </span>
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </header>

      {/* Weekly Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const plan = plans.find(p => p.date === dateStr)
          const dayTasks = plan?.tasks || []
          const isToday = isSameDay(day, new Date())

          return (
            <div 
              key={dateStr} 
              className={`flex flex-col h-full min-h-[500px] rounded-[2rem] border transition-all ${
                isToday 
                ? 'bg-white border-blue-200 shadow-xl shadow-blue-500/5 ring-2 ring-blue-600/5' 
                : 'bg-slate-50/50 border-slate-100'
              }`}
            >
              {/* Day Header */}
              <div className={`p-6 border-b ${isToday ? 'border-blue-50' : 'border-slate-100'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                  {format(day, 'EEE')}
                </p>
                <p className={`text-2xl font-black ${isToday ? 'text-slate-900' : 'text-slate-400'}`}>
                  {format(day, 'dd')}
                </p>
              </div>

              {/* Tasks List */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[600px] custom-scrollbar">
                {loading ? (
                  <div className="py-10 flex justify-center">
                    <Loader2 className="animate-spin text-slate-200" size={24} />
                  </div>
                ) : dayTasks.length > 0 ? (
                  dayTasks.map((task: any) => (
                    <div 
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all group cursor-pointer relative ${
                        task.is_completed 
                        ? 'bg-slate-50 border-slate-100 opacity-60' 
                        : 'bg-white border-white shadow-sm hover:shadow-md hover:border-blue-100'
                      }`}
                    >
                      <div className="flex items-start gap-3" onClick={() => toggleTask(dateStr, task.id)}>
                        <button className={`mt-0.5 transition-colors ${task.is_completed ? 'text-emerald-500' : 'text-slate-300 group-hover:text-blue-400'}`}>
                          {task.is_completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        </button>
                        <div className="flex-1">
                          <p className={`text-xs font-black uppercase tracking-wider mb-1 ${task.is_completed ? 'text-slate-400' : 'text-blue-600'}`}>
                            {task.subject}
                          </p>
                          <p className={`text-sm font-bold leading-tight ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {task.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                             <Clock size={10} className="text-slate-400" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                               {task.duration} Hours
                             </span>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteTask(dateStr, task.id); }}
                        className="absolute top-2 right-2 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-3">
                      <Plus size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Tasks</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Add Study Task</h3>
                <p className="text-sm font-medium text-slate-400">Plan your session for today</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Target Subject</label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({...formData, subject: s})}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.subject === s 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'bg-slate-50 text-slate-500 border border-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Task Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Solve GST RTP Questions"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-600/5 transition-all"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Duration (Hrs)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    min="0.5"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-600/5 transition-all"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Target Date</label>
                  <input 
                    type="date" 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-600/5 transition-all"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                Schedule Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
