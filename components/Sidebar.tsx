'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import './Sidebar.css';
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  BookOpen, 
  Users, 
  Calendar, 
  HelpCircle, 
  BarChart3, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Lock,
  Sparkles,
  Zap,
  RotateCcw,
  Shield
} from 'lucide-react';
import { getUserSubscription } from '@/lib/subscription';
import { createClient } from '@/utils/supabase/client';

const menuItems = [
  { id: 'dashboard', label: 'Home / Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'mock-tests', label: 'Mock Tests', icon: FileText, href: '/mock-tests', badge: true },
  { id: 'test-papers', label: 'Practice Papers', icon: ClipboardList, href: '/test-papers' },
  { id: 'notes', label: 'Notes', icon: BookOpen, href: '/notes' },
  { id: 'mentoring', label: 'Mentoring', icon: Users, href: '/mentoring', premium: true },

  { id: 'admin-mentors', label: 'Manage Mentors', icon: Shield, href: '/admin/mentors', adminOnly: true },
  { id: 'admin-bookings', label: 'Session Requests', icon: Calendar, href: '/admin/bookings', adminOnly: true },
  
  { id: 'my-bookings', label: 'My Bookings', icon: Calendar, href: '/my-bookings' },
  { id: 'study-planner', label: 'Study Planner', icon: Calendar, href: '/study-planner' },
  { id: 'doubts', label: 'Doubts', icon: HelpCircle, href: '/doubts' },
  { id: 'results', label: 'My Results', icon: BarChart3, href: '/results' },
  { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [subscription, setSubscription] = useState({ hasPro: false, hasMentor: false });
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    setSubscription(getUserSubscription());

    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        
        setUserRole(profile?.role || 'student');
      }
    };
    fetchUserRole();
  }, []);

  const { hasPro, hasMentor } = subscription;
  const isAdmin = userRole === 'admin' || pathname.startsWith('/admin');

  // Do not show sidebar on profile pages
  if (pathname?.startsWith('/profile')) {
    return null;
  }

  // Filter menu items based on role
  const visibleMenuItems = menuItems.filter(item => {
    if (item.adminOnly) return isAdmin;
    return true;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[999] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Background Decorative Elements */}
        <div className="sidebar-bg-effects">
          <div className="effect-circle" style={{ top: '10%', left: '-10%', width: '200px', height: '200px' }}></div>
          <div className="effect-circle" style={{ bottom: '10%', right: '-10%', width: '150px', height: '150px', animationDelay: '-2s' }}></div>
        </div>

        {/* Toggle Button */}
        <button 
          className="toggle-sidebar" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-icon">
            <Sparkles size={22} fill="currentColor" />
          </div>
          <span className="logo-text">CA Mentor</span>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {isActive && (
                  <>
                    <div className="active-glow" />
                    <div className="active-bg" />
                  </>
                )}
                
                <div className="nav-icon">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge && !isCollapsed && <span className="badge" />}
                </div>
                
                {!isCollapsed && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.id === 'mentoring' ? (
                      !hasMentor && <Lock size={14} className="lock-icon" />
                    ) : (
                      item.premium && !hasPro && <Lock size={14} className="lock-icon" />
                    )}
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                   <div className="absolute left-full ml-6 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                     {item.label}
                   </div>
                 )}
              </Link>
            );
          })}

          <div className="mt-auto pt-4 border-t border-gray-50">
            <div 
              className="nav-item text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
              onClick={async () => {
                const { createClient } = await import('@/utils/supabase/client');
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push('/login');
              }}
            >
              <div className="nav-icon">
                <LogOut size={20} />
              </div>
              {!isCollapsed && <span className="nav-label">Logout</span>}
            </div>
          </div>
        </nav>

        {/* Upgrade Card */}
        <div className="upgrade-card">
          {!isCollapsed ? (
            <>
              {hasPro ? (
                <>
                  <div className="upgrade-title text-emerald-600 flex items-center gap-2">
                    <Sparkles size={16} fill="currentColor" />
                    Premium Active
                  </div>
                  <p className="upgrade-text">You have full access to all CA Mentor resources.</p>
                  <div className="py-2 px-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    {hasMentor ? 'Mentor Plan' : 'Pro Plan'}
                  </div>
                  <div className="flex flex-col gap-2 mt-3">
                    <Link href="/pricing" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline block text-center">
                      View All Plans
                    </Link>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('active_subscription');
                        window.location.reload();
                      }}
                      className="text-[9px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-1 mx-auto"
                    >
                      <RotateCcw size={10} />
                      Reset Demo
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="upgrade-title">Level Up Your Prep</div>
                  <p className="upgrade-text">Unlock full mock tests & mentorship sessions.</p>
                  <Link href="/pricing" className="upgrade-btn">
                    <Zap size={14} fill="currentColor" />
                    Upgrade to Pro
                  </Link>
                </>
              )}
            </>
          ) : (
            <div className="flex justify-center">
              {hasPro ? (
                <Link href="/pricing" className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Sparkles size={18} fill="currentColor" />
                </Link>
              ) : (
                <Link href="/pricing" className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition-colors">
                  <Zap size={18} fill="currentColor" />
                </Link>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Toggle Button (Floating) */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl z-[1001] md:hidden flex items-center justify-center hover:bg-blue-700 transition-transform active:scale-90"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <LayoutDashboard size={24} />
      </button>
    </>
  );
};

export default Sidebar;
