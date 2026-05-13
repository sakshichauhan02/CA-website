'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2,
  X,
  AlertCircle,
  Clock,
  BookOpen,
  Award
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export default function NewPaperPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [file, setFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    subject: 'Accounting',
    marks: 100,
    description: '',
    isPremium: false
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    } else {
      toast.error("Please select a valid PDF file")
    }
  }

  const handleUpload = async () => {
    if (!file || !formData.title) {
      toast.error("Please fill all required fields")
      return
    }

    setIsSubmitting(true)
    setUploadProgress(10)

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `papers/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('papers')
        .upload(filePath, file)

      if (uploadError) throw uploadError
      setUploadProgress(60)

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('papers')
        .getPublicUrl(filePath)

      // 3. Save Metadata to DB
      const { error: dbError } = await supabase
        .from('papers')
        .insert({
          title: formData.title,
          subject: formData.subject,
          marks: formData.marks,
          description: formData.description,
          pdf_url: publicUrl,
          is_premium: formData.isPremium
        })

      if (dbError) throw dbError

      setUploadProgress(100)
      toast.success("Test paper uploaded successfully!")
      router.push('/admin/papers')
    } catch (err: any) {
      toast.error(err.message || "Upload failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-10 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Add Test Paper</h1>
            <p className="text-slate-500 font-medium">Upload PDF based previous year papers or mocks.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Form Details */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Paper Title</label>
              <input 
                type="text" 
                placeholder="e.g. May 2023 Accounts Paper"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subject</label>
              <select 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-blue-600/10"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
              >
                <option>Accounting</option>
                <option>Auditing</option>
                <option>Law</option>
                <option>Taxation</option>
                <option>Financial Management</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Marks</label>
                <input 
                  type="number" 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700"
                  value={formData.marks}
                  onChange={e => setFormData({...formData, marks: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium</span>
                 <button 
                  onClick={() => setFormData({...formData, isPremium: !formData.isPremium})}
                  className={`w-12 h-6 rounded-full relative transition-all ${formData.isPremium ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isPremium ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description (Optional)</label>
              <textarea 
                rows={4}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 resize-none"
                placeholder="Briefly describe the contents of this paper..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right: File Upload Area */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Upload className="text-blue-600" size={20} />
              PDF Document
            </h3>

            {!file ? (
              <div className="flex-1 border-4 border-dashed border-slate-50 rounded-[2rem] flex flex-col items-center justify-center p-10 text-center hover:bg-slate-50 transition-all group relative">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText size={32} />
                </div>
                <p className="font-bold text-slate-700">Drag & Drop PDF</p>
                <p className="text-xs text-slate-400 mt-1">Maximum file size: 10MB</p>
                
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="flex-1 bg-blue-50/50 rounded-[2rem] p-8 border border-blue-100 flex flex-col items-center justify-center text-center relative">
                <button 
                  onClick={() => setFile(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm"
                >
                  <X size={16} />
                </button>
                <FileText size={48} className="text-blue-600 mb-4" />
                <p className="font-black text-blue-900 line-clamp-1">{file.name}</p>
                <p className="text-xs font-bold text-blue-400 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}

            {isSubmitting && (
              <div className="mt-8 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Uploading to Cloud...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button 
              onClick={handleUpload}
              disabled={isSubmitting || !file}
              className="mt-8 w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Publish Paper
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
