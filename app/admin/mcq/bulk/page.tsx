'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  Loader2,
  Info,
  ChevronDown
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export default function GeneralBulkUploadPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [tests, setTests] = useState<any[]>([])
  const [selectedTestId, setSelectedTestId] = useState<string>('')
  const [csvData, setCsvData] = useState<any[]>([])
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    const fetchTests = async () => {
      const { data } = await supabase
        .from('mcq_tests')
        .select('id, title')
        .order('created_at', { ascending: false })
      
      if (data) {
        setTests(data)
        if (data.length > 0) setSelectedTestId(data[0].id.toString())
      }
      setLoading(false)
    }
    fetchTests()
  }, [supabase])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTestId) {
      toast.error("Please select a test first")
      return
    }

    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const expectedHeaders = ['question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'explanation']
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))

      if (missingHeaders.length > 0) {
        toast.error(`Missing columns: ${missingHeaders.join(', ')}`)
        return
      }

      const rows = lines.slice(1).filter(line => line.trim() !== '').map(line => {
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
        const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim())
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = cleanValues[index] || ''
        })
        return row
      })

      setCsvData(rows)
      setPreview(true)
      toast.success(`${rows.length} questions parsed`)
    }
    reader.readAsText(file)
  }

  const startImport = async () => {
    setIsUploading(true)
    try {
      const formattedData = csvData.map(row => ({
        test_id: selectedTestId,
        question_text: row.question,
        option_a: row.option_a,
        option_b: row.option_b,
        option_c: row.option_c,
        option_d: row.option_d,
        correct_answer: row.correct_option.toUpperCase(),
        explanation: row.explanation
      }))

      const { error } = await supabase.from('questions').insert(formattedData)
      if (error) throw error

      toast.success("Questions imported successfully!")
      router.push('/admin/mcq-management')
    } catch (err: any) {
      toast.error(err.message || "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="p-10 max-w-[1000px] mx-auto">
      <header className="mb-12">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-6">
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-4xl font-black text-slate-900">Bulk Upload Questions</h1>
      </header>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl mb-10">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Target Mock Test</label>
        <div className="relative">
          <select 
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-blue-600/10"
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
          >
            {tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            {tests.length === 0 && <option>No tests available - Create one first</option>}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>
      </div>

      {!preview ? (
        <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-all">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Upload size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-4">Select CSV File</h3>
          <label className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl cursor-pointer hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
            Choose File
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-800">Preview ({csvData.length})</h3>
            <button 
              onClick={startImport}
              disabled={isUploading}
              className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
            >
              {isUploading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              Start Import
            </button>
          </div>
          <div className="max-h-[400px] overflow-auto">
             {/* Simple List Preview */}
             {csvData.slice(0, 5).map((row, i) => (
               <div key={i} className="p-4 border-b border-slate-50">
                 <p className="font-bold text-slate-700">{row.question}</p>
                 <p className="text-xs text-blue-600 font-black mt-1">Ans: {row.correct_option}</p>
               </div>
             ))}
             {csvData.length > 5 && <p className="p-4 text-slate-400 text-center font-bold">... and {csvData.length - 5} more questions</p>}
          </div>
        </div>
      )}
    </div>
  )
}
