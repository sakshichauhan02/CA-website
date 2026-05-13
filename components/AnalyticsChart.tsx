'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Jan', value: 400, growth: 240 },
  { name: 'Feb', value: 300, growth: 139 },
  { name: 'Mar', value: 200, growth: 980 },
  { name: 'Apr', value: 278, growth: 390 },
  { name: 'May', value: 189, growth: 480 },
  { name: 'Jun', value: 239, growth: 380 },
];

export default function AnalyticsChart() {
  return (
    <div className="w-full h-[400px] bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <div className="w-2 h-6 bg-blue-600 rounded-full" />
        Performance Analytics
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '20px', 
              border: 'none', 
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              padding: '12px 16px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#2563eb" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
