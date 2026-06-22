"use client";
import React, { useState } from 'react';
import { Search, UserX, UserCheck, Ticket, CreditCard } from 'lucide-react';

const passengers = [
  { id: "USR-001", name: "Arun Kumar", email: "arun.k@gmail.com", phone: "+91 98430 11234", bookings: 12, spent: "₹360", joined: "Jan 2026", status: "Active" },
  { id: "USR-002", name: "Priya S", email: "priya.s@gmail.com", phone: "+91 94430 55678", bookings: 8, spent: "₹200", joined: "Feb 2026", status: "Active" },
  { id: "USR-003", name: "Karthik R", email: "karthik.r@gmail.com", phone: "+91 93430 77890", bookings: 3, spent: "₹75", joined: "Mar 2026", status: "Suspended" },
  { id: "USR-004", name: "Meena L", email: "meena.l@gmail.com", phone: "+91 87430 33456", bookings: 21, spent: "₹630", joined: "Dec 2025", status: "Active" },
  { id: "USR-005", name: "Suresh P", email: "suresh.p@gmail.com", phone: "+91 99430 22345", bookings: 5, spent: "₹150", joined: "Apr 2026", status: "Active" },
];

export default function PassengersTab() {
  const [search, setSearch] = useState('');
  const filtered = passengers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Passenger Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">{passengers.length} registered users</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2">
          <Search size={15} className="text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search passengers..."
            className="bg-transparent text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none w-48"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: passengers.length, color: "text-white" },
          { label: "Active Users", value: passengers.filter(p => p.status === 'Active').length, color: "text-emerald-400" },
          { label: "Suspended", value: passengers.filter(p => p.status === 'Suspended').length, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800/60">
              {["User", "Contact", "Bookings", "Total Spent", "Joined", "Status", "Actions"].map(h => (
                <th key={h} className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors last:border-0">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                      {p.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="text-xs text-slate-600">{p.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="text-xs text-slate-400">{p.email}</p>
                  <p className="text-xs text-slate-600">{p.phone}</p>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 text-sm text-slate-300"><Ticket size={12} className="text-slate-600" />{p.bookings}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1 text-sm font-bold text-white"><CreditCard size={12} className="text-slate-600" />{p.spent}</div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-500">{p.joined}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${p.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    {p.status === 'Active'
                      ? <button className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><UserX size={14} /></button>
                      : <button className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"><UserCheck size={14} /></button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
