"use client";
import React from 'react';
import { Wifi, WifiOff, Navigation, Clock, Bus } from 'lucide-react';

const buses = [
  { id: "TN63-1001", route: "Gandhipuram → Ukkadam", lat: 11.0168, lng: 76.9558, speed: "32 km/h", eta: "8 min", status: "On Route", gps: true, progress: 65 },
  { id: "TN63-1002", route: "Singanallur → Marudamalai", lat: 11.0021, lng: 77.0037, speed: "28 km/h", eta: "12 min", status: "On Route", gps: true, progress: 40 },
  { id: "TN63-1003", route: "RS Puram → Ganapathy", lat: 11.0074, lng: 76.9419, speed: "0 km/h", eta: "—", status: "Stopped", gps: true, progress: 80 },
  { id: "TN63-1004", route: "Peelamedu → Town Hall", lat: 11.0274, lng: 77.0192, speed: "—", eta: "—", status: "GPS Off", gps: false, progress: 0 },
  { id: "TN63-1005", route: "Saibaba Colony → Airport", lat: 11.0199, lng: 76.9641, speed: "41 km/h", eta: "5 min", status: "On Route", gps: true, progress: 85 },
];

export default function GpsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">GPS Tracking Center</h2>
        <p className="text-sm text-slate-500 mt-0.5">Live fleet monitoring across all routes</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active GPS Buses", value: "4", color: "text-emerald-400" },
          { label: "GPS Off", value: "1", color: "text-red-400" },
          { label: "Tracking Sessions", value: "38", color: "text-blue-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#0d1117] border border-slate-800/60 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Map placeholder */}
      <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl overflow-hidden h-48 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0d1117] to-slate-900 opacity-90" />
        <div className="relative z-10 text-center">
          <Navigation size={32} className="text-orange-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-300">Live Map View</p>
          <p className="text-xs text-slate-600 mt-1">Integrate Leaflet / MapLibre for live bus positions</p>
        </div>
      </div>

      <div className="bg-[#0d1117] border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800/60">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fleet Status</h3>
        </div>
        <div className="divide-y divide-slate-800/40">
          {buses.map(bus => (
            <div key={bus.id} className="p-4 hover:bg-slate-800/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bus.gps ? 'bg-emerald-500/10' : 'bg-slate-700/50'}`}>
                    <Bus size={15} className={bus.gps ? 'text-emerald-400' : 'text-slate-600'} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{bus.id}</p>
                    <p className="text-xs text-slate-500">{bus.route}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Navigation size={11} />{bus.speed}</span>
                  <span className="flex items-center gap-1"><Clock size={11} />ETA: {bus.eta}</span>
                  {bus.gps
                    ? <span className="flex items-center gap-1 text-emerald-400 font-semibold"><Wifi size={11} />Live</span>
                    : <span className="flex items-center gap-1 text-slate-600 font-semibold"><WifiOff size={11} />Offline</span>
                  }
                </div>
              </div>
              {bus.gps && bus.progress > 0 && (
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden ml-11">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" style={{ width: `${bus.progress}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
