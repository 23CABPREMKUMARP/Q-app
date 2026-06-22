"use client";
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Wifi, WifiOff, QrCode, Bus } from 'lucide-react';

const buses = [
  { id: "TN63-1001", code: "DB-001", route: "Gandhipuram → Ukkadam", capacity: 52, status: "Active", gps: true },
  { id: "TN63-1002", code: "DB-002", route: "Singanallur → Marudamalai", capacity: 52, status: "Active", gps: true },
  { id: "TN63-1003", code: "DB-003", route: "RS Puram → Ganapathy", capacity: 48, status: "Maintenance", gps: false },
  { id: "TN63-1004", code: "DB-004", route: "Peelamedu → Town Hall", capacity: 52, status: "Active", gps: false },
  { id: "TN63-1005", code: "DB-005", route: "Saibaba Colony → Airport", capacity: 44, status: "Idle", gps: true },
];

export default function FleetTab() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Fleet Manager</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage all buses in the network</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} /> Add Bus
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#0d1117] border border-orange-500/30 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-4">Add New Bus</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {["Bus Number", "Bus Code", "Route", "Capacity", "Conductor", "Status"].map(f => (
              <div key={f}>
                <label className="block text-xs text-slate-500 mb-1">{f}</label>
                <input className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50" placeholder={`Enter ${f}...`} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">Add Bus</button>
            <button onClick={() => setShowAdd(false)} className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800/60">
              {["Bus Number", "Code", "Route", "Capacity", "GPS", "Status", "Actions"].map(h => (
                <th key={h} className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {buses.map(bus => (
              <tr key={bus.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors last:border-0">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Bus size={14} className="text-orange-400" />
                    </div>
                    <span className="text-sm font-bold text-white">{bus.id}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-400">{bus.code}</td>
                <td className="py-3 px-4 text-sm text-slate-300 max-w-[180px] truncate">{bus.route}</td>
                <td className="py-3 px-4 text-sm text-slate-400">{bus.capacity}</td>
                <td className="py-3 px-4">
                  {bus.gps
                    ? <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold"><Wifi size={12} /> Live</span>
                    : <span className="flex items-center gap-1 text-slate-600 text-xs font-semibold"><WifiOff size={12} /> Off</span>}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${bus.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : bus.status === 'Maintenance' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-500/10 text-slate-500'}`}>
                    {bus.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"><Edit2 size={14} /></button>
                    <button className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"><QrCode size={14} /></button>
                    <button className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
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
