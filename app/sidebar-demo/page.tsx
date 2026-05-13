'use client';

import Sidebar from '@/components/Sidebar';
import { 
  FileText, 
  Trophy, 
  Target, 
  History, 
  ArrowRight,
  Bell,
  LogOut,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import '@/components/DashboardOverview.css';

export default function SidebarDemo() {
  const stats = {
    totalTests: 12,
    avgScore: 84.5,
    strongSubject: 'Direct Taxation'
  };

  const results = [
    { id: 1, test_name: 'CA Inter - Group 1 Mock', created_at: new Date().toISOString(), total_score: 88 },
    { id: 2, test_name: 'Advanced Accounting Unit Test', created_at: new Date(Date.now() - 86400000).toISOString(), total_score: 72 },
    { id: 3, test_name: 'Corporate & Other Laws', created_at: new Date(Date.now() - 172800000).toISOString(), total_score: 91 },
  ];

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      
      {/* Abstract Background Effects */}
      <div className="dashboard-bg-decor">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="particle" style={{ top: '80%', left: '20%', animationDelay: '0s' }} />
        <div className="particle" style={{ top: '60%', left: '50%', animationDelay: '2s' }} />
        <div className="particle" style={{ top: '90%', left: '80%', animationDelay: '4s' }} />
        <div className="particle" style={{ top: '40%', left: '10%', animationDelay: '6s' }} />
        <div className="particle" style={{ top: '70%', left: '90%', animationDelay: '8s' }} />
      </div>

      <div className="flex-1 md:ml-[280px] min-h-screen relative z-10 transition-all duration-400">
        {/* Sticky Header */}
        <header className="dashboard-header">
          <div className="flex flex-col">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Premium Preview</h2>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-800">Welcome Back, Sakshi Chauhan</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-[1px] bg-slate-200" />
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-10 max-w-7xl mx-auto w-full">
          <div className="reveal-anim">
             <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Performance Hub</h1>
             <p className="text-slate-500 text-lg font-medium">Track your journey to becoming a Chartered Accountant.</p>
          </div>

          {/* Premium Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card reveal-anim" style={{ animationDelay: '0.1s' }}>
              <div className="stat-icon-wrapper bg-blue-50 text-blue-600">
                <FileText size={28} />
              </div>
              <p className="stat-label">Tests Taken</p>
              <div className="stat-value">
                {stats.totalTests}
                <span className="stat-trend bg-blue-50 text-blue-600 flex items-center gap-1">
                  <TrendingUp size={12} />
                  +2 this week
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400">Keep going! You're in the top 15%</p>
            </div>

            <div className="stat-card reveal-anim" style={{ animationDelay: '0.2s' }}>
              <div className="stat-icon-wrapper bg-emerald-50 text-emerald-600">
                <Trophy size={28} />
              </div>
              <p className="stat-label">Average Score</p>
              <div className="stat-value text-emerald-600">
                {stats.avgScore}
                <span className="text-lg font-bold text-slate-300">/ 100</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.avgScore}%` }} />
              </div>
            </div>

            <div className="stat-card reveal-anim" style={{ animationDelay: '0.3s' }}>
              <div className="stat-icon-wrapper bg-amber-50 text-amber-600">
                <Target size={28} />
              </div>
              <p className="stat-label">Strong Subject</p>
              <div className="stat-value text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 truncate">
                {stats.strongSubject}
              </div>
              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-full border border-amber-100">Expert Level</span>
                <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase rounded-full">Top Scorer</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Table Section */}
          <div className="activity-section reveal-anim" style={{ animationDelay: '0.4s' }}>
            <div className="table-header-custom">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <History className="text-blue-600" />
                  Recent Test Activity
                </h3>
                <p className="text-sm font-medium text-slate-400 mt-1">Detailed breakdown of your latest mock attempts</p>
              </div>
              <button className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                View All Results
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Subject / Test Name</th>
                    <th>Attempt Date</th>
                    <th>Performance</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((activity, i) => (
                    <tr key={i} className="activity-row">
                      <td className="font-bold text-slate-700">{activity.test_name}</td>
                      <td className="font-medium text-slate-400">{new Date(activity.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`score-badge ${
                          activity.total_score >= 80 ? 'bg-emerald-50 text-emerald-600' : 
                          activity.total_score >= 60 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {activity.total_score}
                        </span>
                      </td>
                      <td className="text-right">
                        <button className="action-btn-premium inline-flex">
                          View Details
                          <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
