import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  FileText, 
  BookOpen, 
  HelpCircle, 
  CreditCard, 
  UserSquare2,
  LogOut,
  ChevronRight,
  Menu,
  Bell,
  Search,
  Zap,
  Calendar
} from 'lucide-react'
import '@/components/admin/Admin.css'

import { adminLogout } from './auth-actions'

// Define the Menu Items
const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Sparkles, label: 'MCQ Tests', href: '/admin/mcq-management' },
  { icon: FileText, label: 'Test Papers', href: '/admin/papers' },
  { icon: BookOpen, label: 'Notes', href: '/admin/notes' },
  { icon: HelpCircle, label: 'Doubts', href: '/admin/doubts' },
  { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
  { icon: UserSquare2, label: 'Manage Mentors', href: '/admin/mentors' },
  { icon: Calendar, label: 'Session Requests', icon_alt: Calendar, href: '/admin/bookings' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  /*
  // 1. Check if user is logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Fetch role from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // 3. Redirect if not admin
  if (profileError || profile?.role !== 'admin') {
    // If you haven't set up the 'admin' role yet, you might get redirected.
    // For now, let's allow access if the email is a specific one OR if role is admin.
    // Actually, following the user's strict instruction:
    redirect('/dashboard')
  }
  */


  return (
    <div className="admin-container">
      {/* Floating Glass Sidebar */}
      <aside className="admin-sidebar shadow-2xl">
        <div className="p-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
            <Zap size={24} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg text-slate-900 tracking-tighter leading-none">CA MENTOR</span>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Admin Portal</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              className="admin-nav-item group"
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className="group-hover:text-blue-600 transition-colors" />
                <span>{item.label}</span>
              </div>
              <ChevronRight size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
            </Link>
          ))}
        </nav>

        <div className="p-6">
          <form action={adminLogout}>
            <button 
              type="submit"
              className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest border border-transparent hover:border-red-100"
            >
              <LogOut size={18} />
              Logout Session
            </button>
          </form>
        </div>
      </aside>

      {/* Main Experience Area */}
      <div className="admin-main">
        {/* Floating Header */}
        <header className="admin-header">
          <div className="flex items-center gap-4 lg:hidden">
            <button className="p-2 text-slate-500">
              <Menu size={24} />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-4 bg-slate-50/50 px-6 py-3 rounded-2xl border border-slate-100/50 group focus-within:bg-white focus-within:border-blue-100 transition-all">
             <Search size={18} className="text-slate-400 group-focus-within:text-blue-600" />
             <input 
               type="text" 
               placeholder="Search everything..." 
               className="bg-transparent border-none outline-none text-sm font-bold text-slate-600 w-64 placeholder:text-slate-300"
             />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
            </button>
            
            <div className="flex items-center gap-4 bg-white p-1.5 pr-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg">
                AD
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-black text-slate-900 leading-none">Administrator</p>
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">Super Access</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </main>
      </div>
    </div>
  )
}
