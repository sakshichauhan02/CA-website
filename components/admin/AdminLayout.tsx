'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  UserSquare2, 
  CalendarCheck, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  Bell,
  Menu,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './Admin.css'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Sparkles, label: 'MCQ Management', href: '/admin/mcq-management' },
  { icon: FileText, label: 'Test Papers', href: '/admin/papers' },
  { icon: BookOpen, label: 'Notes', href: '/admin/notes' },
  { icon: HelpCircle, label: 'Doubts', href: '/admin/doubts' },
  { icon: UserSquare2, label: 'Mentors', href: '/admin/mentors' },
  { icon: CalendarCheck, label: 'Bookings', href: '/admin/bookings' },
  { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export function AdminSidebar({ collapsed, setCollapsed }: { collapsed: boolean, setCollapsed: (val: boolean) => void }) {
  const pathname = usePathname()

  return (
    <div className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Sparkles size={24} fill="currentColor" />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight">CA Mentor</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.label} href={item.href}>
              <div className={`admin-nav-item ${isActive ? 'active' : ''} group`}>
                <item.icon size={20} className={collapsed ? 'mx-auto' : ''} />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {collapsed && (
                  <div className="absolute left-20 bg-slate-900 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-slate-50">
        <button className="admin-nav-item w-full text-red-500 hover:bg-red-50 hover:text-red-600 !mx-0">
          <LogOut size={20} className={collapsed ? 'mx-auto' : ''} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

export function AdminHeader() {
  return (
    <header className="admin-header">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search analytics, users, payments..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/10 outline-none font-medium text-sm text-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200" />
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-tight">Admin User</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Super Admin</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-md">
            AD
          </div>
        </div>
      </div>
    </header>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="admin-container">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 w-[280px] bg-white z-[70] lg:hidden"
          >
            <AdminSidebar collapsed={false} setCollapsed={() => setIsMobileMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`admin-main ${collapsed ? 'expanded' : ''} flex-1`}>
        {/* Mobile Header Toggle */}
        <div className="lg:hidden p-4 bg-white border-bottom flex items-center justify-between sticky top-0 z-50">
           <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} fill="currentColor" />
            </div>
            <span className="font-black text-lg text-slate-900">CA Mentor</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-500">
            <Menu size={24} />
          </button>
        </div>

        <AdminHeader />
        
        <main className="min-h-screen">
          {children}
        </main>

        <footer className="p-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest border-t border-slate-50">
          © 2026 CA Mentor Admin Panel • Powered by Antigravity
        </footer>
      </div>
    </div>
  )
}
