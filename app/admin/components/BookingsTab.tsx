"use client";
import React, { useState } from 'react';
import { Search, Download, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';

const bookings = [
  { id: "BK-9901", passenger: "Arun Kumar", route: "Gandhipuram → Ukkadam", date: "22 Jun 2026", seats: 2, amount: "₹30", status: "Confirmed" },
  { id: "BK-9902", passenger: "Priya S", route: "Singanallur → Marudamalai", date: "22 Jun 2026", seats: 1, amount: "₹25", status: "Active" },
  { id: "BK-9903", passenger: "Karthik R", route: "RS Puram → Ganapathy", date: "22 Jun 2026", seats: 3, amount: "₹36", status: "Cancelled" },
  { id: "BK-9904", passenger: "Meena L", route: "Peelamedu → Town Hall", date: "21 Jun 2026", seats: 1, amount: "₹30", status: "Completed" },
  { id: "BK-9905", passenger: "Suresh P", route: "Saibaba Colony → Airport", date: "21 Jun 2026", seats: 2, amount: "₹40", status: "Confirmed" },
  { id: "BK-9906", passenger: "Divya M", route: "Gandhipuram → Ukkadam", date: "21 Jun 2026", seats: 1, amount: "₹15", status: "Completed" },
];

const statusStyle: Record<string, string> = {
  Confirmed: "bg-blue-500/10 text-blue-400",
  Active: "bg-emerald-500/10 text-emerald-400",
  Cancelled: "bg-red-500/10 text-red-400",
  Completed: "bg-slate-500/10 text-slate-400",
};

const statusIcon: Record<string, any> = {
  Confirmed: Clock,
  Active: CheckCircle,
  Cancelled: XCircle,
  Completed: CheckCircle,
};

export default function BookingsTab() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Active", "Confirmed", "Completed", "Cancelled"];
  const filtered = filter === "All" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Booking Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">{bookings.length} bookings today</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {f}
          </button>
        ))}
        <div className="ml-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input placeholder="Search bookings..." className="bg-slate-800/50 border border-slate-700 rounded-lg pl-8 pr-4 py-1.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50" />
        </div>
      </div>

      <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800/60">
              {["Booking ID", "Passenger", "Route", "Date", "Seats", "Amount", "Status"].map(h => (
                <th key={h} className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => {
              const Icon = statusIcon[b.status];
              return (
                <tr key={b.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors last:border-0">
                  <td className="py-3 px-4 text-sm font-mono text-orange-400">{b.id}</td>
                  <td className="py-3 px-4 text-sm text-white font-medium">{b.passenger}</td>
                  <td className="py-3 px-4 text-sm text-slate-400 max-w-[160px] truncate">{b.route}</td>
                  <td className="py-3 px-4 text-sm text-slate-400">{b.date}</td>
                  <td className="py-3 px-4 text-sm text-slate-400">{b.seats}</td>
                  <td className="py-3 px-4 text-sm font-bold text-white">{b.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusStyle[b.status]}`}>
                      <Icon size={11} />{b.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
