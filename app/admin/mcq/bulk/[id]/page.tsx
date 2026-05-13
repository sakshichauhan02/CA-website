'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Trash2,
  Download,
  Info
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export default function BulkUploadPage() {
  const router = useRouter()
  const { id } = useParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [test, setTest] = useState<any>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    const fetchTest = async () => {
      const { data, error } = await supabase
        .from('mcq_tests')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) setTest(data)
      setLoading(false)
    }
    fetchTest()
  }, [id, supabase])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file")
      return
    }

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
        // Advanced Regex to split CSV while respecting quotes
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
      toast.success(`${rows.length} questions parsed successfully`)
    }
    reader.readAsText(file)
  }

  const startImport = async () => {
    if (csvData.length === 0) return
    setIsUploading(true)

    try {
      const formattedData = csvData.map(row => ({
        test_id: id,
        question_text: row.question,
        option_a: row.option_a,
        option_b: row.option_b,
        option_c: row.option_c,
        option_d: row.option_d,
        correct_answer: row.correct_option.toUpperCase(),
        explanation: row.explanation
      }))

      const { error } = await supabase
        .from('questions')
        .insert(formattedData)

      if (error) throw error

      // Update question count in test
      await supabase
        .rpc('increment_question_count', { test_id_input: id, increment_by: formattedData.length })
      
      // Fallback: If RPC doesn't exist, just update manually
      await supabase
        .from('mcq_tests')
        .update({ questions_count: (test.questions_count || 0) + formattedData.length })
        .eq('id', id)

      toast.success("All questions imported successfully!")
      router.push('/admin/mcq-management')
    } catch (err: any) {
      toast.error(err.message || "Bulk upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="p-10 max-w-[1200px] mx-auto">
      <header className="mb-12">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-6 transition-all">
          <ArrowLeft size={20} />
          Back to Tests
        </button>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Bulk Question Upload</h1>
        <p className="text-slate-500 font-medium mt-1">Populate <span className="text-blue-600 font-bold">"{test?.title}"</span> using a CSV file.</p>
      </header>

      {/* Upload Box */}
      {!preview ? (
        <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-all">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <Upload size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-4">Select your CSV File</h3>
          <p className="text-slate-400 max-w-sm mb-10 font-medium">Your file must contain columns for question, options (A-D), correct option, and explanation.</p>
          
          <label className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl cursor-pointer hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
            Browse Files
            <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
          </label>

          <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4 text-left max-w-md">
            <Info className="text-blue-500 shrink-0" size={20} />
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Column Headers Required:<br/>
              <code className="text-blue-600">question, option_a, option_b, option_c, option_d, correct_option, explanation</code>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Preview Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-800">Preview Data</h3>
                <p className="text-sm font-bold text-slate-400">Review {csvData.length} questions before importing.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setPreview(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={startImport}
                  disabled={isUploading}
                  className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Confirm & Import
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Correct</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {csvData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-800 line-clamp-2">{row.question}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] text-slate-400">A: {row.option_a}</span>
                          <span className="text-[10px] text-slate-400">B: {row.option_b}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black mx-auto">
                          {row.correct_option}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs text-slate-400 italic line-clamp-2">{row.explanation || 'No explanation provided'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
