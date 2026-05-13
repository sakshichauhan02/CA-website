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
  BookOpen,
  Layout
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export default function NewNotePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [file, setFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    subject: 'Accounting',
    chapter: '',
    topic: '',
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
      // 1. Upload to Supabase Storage (Bucket: notes)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = fileName

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file)


      if (uploadError) throw uploadError
      setUploadProgress(60)

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('notes')
        .getPublicUrl(filePath)

      // 3. Save Metadata to DB
        const { error: dbError } = await supabase
          .from('notes')
          .insert({
            title: formData.title,
            subject: formData.subject,
            chapter: formData.chapter,
            topic: formData.topic,
            file_url: publicUrl,
            is_premium: formData.isPremium
          })

      if (dbError) throw dbError

      setUploadProgress(100)
      toast.success("Notes uploaded successfully!")
      router.push('/admin/notes')
    } catch (err: any) {
      toast.error(err.message || "Upload failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-10 max-w-[1000px] mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Upload Study Notes</h1>
            <p className="text-slate-500 font-medium italic">Publish chapter-wise PDFs and resources for students.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Notes Title</label>
              <input 
                type="text" 
                placeholder="e.g. GST Basics - Chapter 1"
                className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-600/5 transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Subject</label>
                <select 
                  className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-slate-700 appearance-none focus:ring-4 focus:ring-blue-600/5 transition-all"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                >
                  <option>Accounting</option>
                  <option>Law</option>
                  <option>Taxation</option>
                  <option>Costing</option>
                  <option>Audit</option>
                  <option>FM</option>
                  <option>Economics</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Chapter</label>
                <input 
                  type="text" 
                  placeholder="e.g. Chapter 4"
                  className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-600/5 transition-all"
                  value={formData.chapter}
                  onChange={e => setFormData({...formData, chapter: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Topic / Description</label>
              <input 
                type="text" 
                placeholder="e.g. Input Tax Credit under GST"
                className="w-full px-8 py-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-slate-700 focus:ring-4 focus:ring-blue-600/5 transition-all"
                value={formData.topic}
                onChange={e => setFormData({...formData, topic: e.target.value})}
              />
            </div>


            <div className="flex items-center justify-between p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
               <div>
                 <p className="font-black text-blue-900">Premium Notes</p>
                 <p className="text-xs font-medium text-blue-400 mt-0.5">Only subscribers can download this PDF.</p>
               </div>
               <button 
                onClick={() => setFormData({...formData, isPremium: !formData.isPremium})}
                className={`w-14 h-8 rounded-full relative transition-all ${formData.isPremium ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.isPremium ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* File Area */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full min-h-[400px]">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
              <Upload className="text-blue-600" size={20} />
              PDF File
            </h3>

            {!file ? (
              <div className="flex-1 border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center hover:bg-slate-50 transition-all group relative">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText size={40} />
                </div>
                <p className="font-black text-slate-700">Drop PDF Here</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Max 20MB</p>
                
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
                  className="absolute top-4 right-4 w-10 h-10 bg-white text-slate-400 hover:text-red-500 rounded-2xl flex items-center justify-center shadow-sm transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-sm mb-6">
                  <FileText size={40} />
                </div>
                <p className="font-black text-blue-900 line-clamp-2 leading-tight">{file.name}</p>
                <p className="text-xs font-black text-blue-400 mt-2">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}

            {isSubmitting && (
              <div className="mt-8 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Uploading to Cloud...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-500 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button 
              onClick={handleUpload}
              disabled={isSubmitting || !file}
              className="mt-8 w-full py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Publish Notes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
