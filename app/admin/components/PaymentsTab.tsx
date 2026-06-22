"use client";
import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw, Download } from 'lucide-react';

const payments = [
  { id: "TXN-44821", booking: "BK-9901", passenger: "Arun Kumar", method: "PhonePe", amount: "₹30", status: "Success", time: "10:22 AM" },
  { id: "TXN-44822", booking: "BK-9902", passenger: "Priya S", method: "UPI", amount: "₹25", status: "Success", time: "10:35 AM" },
  { id: "TXN-44823", booking: "BK-9903", passenger: "Karthik R", method: "PhonePe", amount: "₹36", status: "Failed", time: "10:41 AM" },
  { id: "TXN-44824", booking: "BK-9904", passenger: "Meena L", method: "Card", amount: "₹30", status: "Refunded", time: "11:02 AM" },
  { id: "TXN-44825", booking: "BK-9905", passenger: "Suresh P", method: "PhonePe", amount: "₹40", status: "Pending", time: "11:18 AM" },
  { id: "TXN-44826", booking: "BK-9906", passenger: "Divya M", method: "UPI", amount: "₹15", status: "Success", time: "11:29 AM" },
];

const statusStyle: Record<string, string> = {
  Success: "bg-emerald-500/10 text-emerald-400",
  Failed: "bg-red-500/10 text-red-400",
  Pending: "bg-yellow-500/10 text-yellow-400",
  Refunded: "bg-blue-500/10 text-blue-400",
};

const statusIcon: Record<string, any> = {
  Success: CheckCircle,
  Failed: XCircle,
  Pending: Clock,
  Refunded: RefreshCw,
};

const summary = [
  { label: "Total Collected", value: "₹84,320", color: "text-emerald-400" },
  { label: "Failed Payments", value: "₹2,140", color: "text-red-400" },
  { label: "Pending", value: "₹640", color: "text-yellow-400" },
  { label: "Refunded", value: "₹1,200", color: "text-blue-400" },
];

export default function PaymentsTab() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Success", "Failed", "Pending", "Refunded"];
  const filtered = filter === "All" ? payments : payments.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Payment Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">PhonePe & UPI transactions</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map(s => (
          <div key={s.label} className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-4">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${filter === f ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800/60">
              {["Transaction ID", "Booking ID", "Passenger", "Method", "Amount", "Time", "Status"].map(h => (
                <th key={h} className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const Icon = statusIcon[p.status];
              return (
                <tr key={p.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors last:border-0">
                  <td className="py-3 px-4 text-sm font-mono text-orange-400">{p.id}</td>
                  <td className="py-3 px-4 text-sm text-slate-400">{p.booking}</td>
                  <td className="py-3 px-4 text-sm text-white font-medium">{p.passenger}</td>
                  <td className="py-3 px-4 text-sm text-slate-400">{p.method}</td>
                  <td className="py-3 px-4 text-sm font-bold text-white">{p.amount}</td>
                  <td className="py-3 px-4 text-sm text-slate-500">{p.time}</td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${statusStyle[p.status]}`}>
                      <Icon size={11} />{p.status}
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
