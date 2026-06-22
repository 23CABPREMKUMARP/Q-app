"use client";
import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Bar = ({ label, value, max, color }: any) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-slate-500 w-28 truncate shrink-0">{label}</span>
    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
    <span className="text-xs font-bold text-slate-300 w-12 text-right shrink-0">{value}</span>
  </div>
);

export default function AnalyticsTab() {
  const [range, setRange] = useState('Weekly');
  const ranges = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  const revenue = [
    { day: "Mon", v: 11200 }, { day: "Tue", v: 14800 }, { day: "Wed", v: 9600 },
    { day: "Thu", v: 17300 }, { day: "Fri", v: 21000 }, { day: "Sat", v: 18500 }, { day: "Sun", v: 12400 },
  ];
  const maxRev = Math.max(...revenue.map(r => r.v));

  const routes = [
    { label: "Gandhipuram → Ukkadam", value: 342 },
    { label: "Singanallur → Marudamalai", value: 278 },
    { label: "Peelamedu → Town Hall", value: 211 },
    { label: "RS Puram → Ganapathy", value: 189 },
    { label: "Saibaba Colony → Airport", value: 134 },
  ];

  const kpis = [
    { label: "Total Revenue", value: "₹4,84,200", change: "+12%", up: true },
    { label: "Total Bookings", value: "8,941", change: "+8%", up: true },
    { label: "Avg Occupancy", value: "74%", change: "+3%", up: true },
    { label: "Failed Payments", value: "156", change: "+2%", up: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">Revenue, bookings & performance insights</p>
        </div>
        <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1">
          {ranges.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${range === r ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-5">
            <p className="text-2xl font-bold text-white">{k.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {k.change} this {range.toLowerCase()}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Revenue — This Week</h3>
          <div className="flex items-end gap-2 h-32">
            {revenue.map(r => (
              <div key={r.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-orange-500/80 rounded-t-md transition-all" style={{ height: `${(r.v / maxRev) * 100}%` }} />
                <span className="text-[10px] text-slate-600">{r.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Route Popularity (Bookings)</h3>
          <div className="space-y-3">
            {routes.map(r => (
              <Bar key={r.label} label={r.label} value={r.value} max={400} color="bg-gradient-to-r from-orange-500 to-orange-400" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Payment Analytics</h3>
          <div className="space-y-3">
            {[
              { label: "PhonePe", value: 68, color: "bg-indigo-500" },
              { label: "UPI", value: 24, color: "bg-blue-500" },
              { label: "Card", value: 8, color: "bg-purple-500" },
            ].map(p => <Bar key={p.label} label={p.label} value={p.value} max={100} color={p.color} />)}
          </div>
        </div>
        <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">GPS Utilization</h3>
          <div className="space-y-3">
            {[
              { label: "Active GPS", value: 62, color: "bg-emerald-500" },
              { label: "GPS Offline", value: 15, color: "bg-red-500" },
              { label: "Idle", value: 23, color: "bg-slate-600" },
            ].map(p => <Bar key={p.label} label={p.label} value={p.value} max={100} color={p.color} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
