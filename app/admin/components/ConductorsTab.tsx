"use client";
import React, { useState } from 'react';
import { Plus, Edit2, UserX, Bus, Ticket, CheckCircle } from 'lucide-react';

const conductors = [
  { id: "CD-001", name: "Ramesh K", email: "ramesh.k@digibus.in", bus: "TN63-1001", route: "Gandhipuram → Ukkadam", trips: 142, tickets: 3280, collections: "₹49,200", status: "Active" },
  { id: "CD-002", name: "Selvam P", email: "selvam.p@digibus.in", bus: "TN63-1002", route: "Singanallur → Marudamalai", trips: 98, tickets: 2410, collections: "₹60,250", status: "Active" },
  { id: "CD-003", name: "Murugan S", email: "murugan.s@digibus.in", bus: "TN63-1003", route: "RS Puram → Ganapathy", trips: 76, tickets: 1820, collections: "₹21,840", status: "Suspended" },
  { id: "CD-004", name: "Anbu R", email: "anbu.r@digibus.in", bus: "—", route: "Unassigned", trips: 0, tickets: 0, collections: "₹0", status: "Inactive" },
];

export default function ConductorsTab() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Conductor Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">{conductors.length} conductors registered</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} /> Add Conductor
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#0d1117] border border-orange-500/30 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-4">Add New Conductor</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {["Full Name", "Email Address", "Employee ID", "Assign Bus", "Assign Route", "Status"].map(f => (
              <div key={f}>
                <label className="block text-xs text-slate-500 mb-1">{f}</label>
                <input className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50" placeholder={`Enter ${f}...`} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">Assign Conductor</button>
            <button onClick={() => setShowAdd(false)} className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {conductors.map(c => (
          <div key={c.id} className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-5 hover:border-orange-500/20 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">{c.name}</p>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : c.status === 'Suspended' ? 'bg-red-500/10 text-red-400' : 'bg-slate-500/10 text-slate-500'}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{c.email} • {c.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"><Edit2 size={14} /></button>
                <button className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><UserX size={14} /></button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[
                { icon: Bus, label: "Bus", value: c.bus },
                { icon: CheckCircle, label: "Trips", value: c.trips },
                { icon: Ticket, label: "Tickets", value: c.tickets },
                { icon: CheckCircle, label: "Collections", value: c.collections },
              ].map(s => (
                <div key={s.label} className="bg-slate-800/30 rounded-xl p-3">
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
