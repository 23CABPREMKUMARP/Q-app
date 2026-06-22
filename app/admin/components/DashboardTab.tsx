"use client";
import React from 'react';
import { Bus, Users, Activity, DollarSign, TrendingUp, MapPin, Ticket, AlertTriangle } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
  <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-5 flex flex-col gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
    {sub && <p className="text-xs text-emerald-400">{sub}</p>}
  </div>
);

const LiveCounter = ({ label, value, color }: any) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
      <span className="text-sm text-slate-400">{label}</span>
    </div>
    <span className="text-lg font-bold text-white">{value}</span>
  </div>
);

export default function DashboardTab() {
  const stats = [
    { icon: Ticket, label: "Total Bookings Today", value: "1,284", sub: "+12% from yesterday", color: "bg-blue-600" },
    { icon: Bus, label: "Active Trips", value: "47", sub: "3 delayed", color: "bg-orange-500" },
    { icon: Activity, label: "Active Buses", value: "62", sub: "8 GPS enabled", color: "bg-violet-600" },
    { icon: DollarSign, label: "Revenue Today", value: "₹84,320", sub: "+8% vs last week", color: "bg-emerald-600" },
    { icon: Users, label: "Online Users", value: "3,421", sub: "Live count", color: "bg-pink-600" },
    { icon: Ticket, label: "Tickets Sold", value: "956", sub: "Today", color: "bg-cyan-600" },
    { icon: TrendingUp, label: "Failed Payments", value: "23", sub: "Needs review", color: "bg-red-600" },
    { icon: MapPin, label: "GPS Sessions", value: "38", sub: "Live tracking", color: "bg-yellow-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Command Center</h2>
        <p className="text-sm text-slate-500 mt-0.5">Real-time operations overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Live Fleet Status</h3>
          <LiveCounter label="Running Buses" value="47" color="bg-emerald-400" />
          <LiveCounter label="Delayed Buses" value="3" color="bg-red-400" />
          <LiveCounter label="Active Conductors" value="41" color="bg-blue-400" />
          <LiveCounter label="Live Tracking Sessions" value="38" color="bg-orange-400" />
          <LiveCounter label="Idle Buses" value="15" color="bg-slate-500" />
        </div>
        <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Recent Alerts</h3>
          {[
            { msg: "Bus TN63-4521 delayed by 15 min on Route 12", time: "2 min ago", type: "warn" },
            { msg: "Payment failed for Booking #BK-9923", time: "5 min ago", type: "error" },
            { msg: "GPS signal lost: Bus TN63-2210", time: "11 min ago", type: "error" },
            { msg: "New conductor assigned: Route 7B", time: "22 min ago", type: "info" },
            { msg: "Bus TN63-1190 trip completed", time: "34 min ago", type: "success" },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
              <AlertTriangle size={14} className={`mt-0.5 shrink-0 ${a.type === 'warn' ? 'text-yellow-400' : a.type === 'error' ? 'text-red-400' : a.type === 'success' ? 'text-emerald-400' : 'text-blue-400'}`} />
              <div>
                <p className="text-sm text-slate-300">{a.msg}</p>
                <p className="text-xs text-slate-600 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
