"use client";
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Clock, IndianRupee } from 'lucide-react';

const routes = [
  { id: "RT-01", name: "Gandhipuram → Ukkadam", stops: 8, distance: "12 km", duration: "35 min", fare: 15 },
  { id: "RT-02", name: "Singanallur → Marudamalai", stops: 11, distance: "18 km", duration: "50 min", fare: 25 },
  { id: "RT-03", name: "RS Puram → Ganapathy", stops: 6, distance: "9 km", duration: "28 min", fare: 12 },
  { id: "RT-04", name: "Peelamedu → Town Hall", stops: 14, distance: "21 km", duration: "60 min", fare: 30 },
  { id: "RT-05", name: "Saibaba Colony → Airport", stops: 9, distance: "15 km", duration: "45 min", fare: 20 },
];

export default function RoutesTab() {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Route Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">{routes.length} active routes</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} /> Add Route
        </button>
      </div>

      {showAdd && (
        <div className="bg-[#0d1117] border border-orange-500/30 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-4">Add New Route</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {["Source", "Destination", "Intermediate Stops", "Distance (km)", "Duration (min)", "Fare (₹)"].map(f => (
              <div key={f}>
                <label className="block text-xs text-slate-500 mb-1">{f}</label>
                <input className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50" placeholder={`Enter ${f}...`} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">Save Route</button>
            <button onClick={() => setShowAdd(false)} className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {routes.map(route => (
          <div key={route.id} className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-5 flex items-center justify-between hover:border-orange-500/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <MapPin size={18} className="text-orange-400" />
              </div>
              <div>
                <p className="font-bold text-white">{route.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{route.id} • {route.stops} stops</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-600" />{route.distance}</div>
              <div className="flex items-center gap-1.5"><Clock size={13} className="text-slate-600" />{route.duration}</div>
              <div className="flex items-center gap-1.5"><IndianRupee size={13} className="text-slate-600" />₹{route.fare}</div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"><Edit2 size={14} /></button>
              <button className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
