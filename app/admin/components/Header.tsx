"use client";
import React from 'react';
import { Bell, Search, RefreshCw } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-[#0d1117] border-b border-slate-800/60 flex items-center justify-between px-6">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search buses, routes, bookings..."
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 text-xs text-slate-400 hover:text-white bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 transition-colors">
          <RefreshCw size={14} />
          <span>Live</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
        <button className="relative p-2 text-slate-400 hover:text-white bg-slate-800/50 border border-slate-700/50 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs font-bold text-white">SA</div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200 leading-none">Super Admin</span>
            <span className="text-xs text-slate-500">admin@digibus.in</span>
          </div>
        </div>
      </div>
    </header>
  );
}
