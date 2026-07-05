"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Truck, CheckCircle, Clock, Package, ArrowRight } from 'lucide-react';

export default function LuggageTrackingPage() {
  const [trackingId, setTrackingId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;
    setIsSearching(true);
    
    // Simulate API Call
    setTimeout(() => {
      setIsSearching(false);
      setTrackingData({
        status: 'In Transit',
        origin: 'Gandhipuram Terminus',
        destination: 'Ukkadam Stand',
        estimatedDelivery: 'Today, 2:30 PM',
        currentLocation: 'Town Hall Junction',
        steps: [
          { status: 'Booked', time: '10:00 AM', completed: true },
          { status: 'Picked up', time: '11:15 AM', completed: true },
          { status: 'In Transit', time: '1:00 PM', completed: true, active: true },
          { status: 'Reached Destination', time: '--', completed: false },
          { status: 'Delivered', time: '--', completed: false },
        ]
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] font-sans text-[#111827] pb-24">
      <div className="bg-[#E8622C] px-6 pt-12 pb-16 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Track</h1>
            <p className="text-[#111827]/80 font-medium text-sm tracking-wide">Live Parcel Tracking</p>
          </div>
          <div className="bg-[#F8FAFC]/20 p-3 rounded-2xl backdrop-blur-md">
            <Search size={32} className="text-[#111827]" />
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8 relative z-20">
        <form onSubmit={handleSearch} className="bg-[#F8FAFC] rounded-3xl p-4 shadow-xl shadow-black/20 flex gap-3">
          <input 
            type="text" 
            placeholder="Enter Tracking ID (e.g. TRK-...)" 
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            className="flex-1 bg-transparent text-slate-900 font-bold outline-none px-2 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={isSearching || !trackingId}
            className="bg-[#E8622C] text-[#111827] p-3 rounded-2xl shadow-lg shadow-[#E8622C]/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSearching ? <div className="w-5 h-5 border-2 border-[#ffffff]/30 border-t-[#ffffff] rounded-full animate-spin"></div> : <Search size={20} />}
          </button>
        </form>

        <AnimatePresence>
          {trackingData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              {/* Status Card */}
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-[#E5E7EB] rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="w-16 h-16 bg-[#E8622C]/10 rounded-full flex items-center justify-center">
                    <Truck size={32} className="text-[#E8622C]" />
                  </div>
                </div>
                
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Current Status</div>
                <div className="text-3xl font-black tracking-tighter text-[#E8622C] mb-6">{trackingData.status}</div>
                
                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">From</div>
                    <div className="text-sm font-black text-[#111827]">{trackingData.origin}</div>
                  </div>
                  <div className="px-4 text-[#6B7280]"><ArrowRight size={16} /></div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">To</div>
                    <div className="text-sm font-black text-[#111827]">{trackingData.destination}</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-[#E5E7EB] rounded-3xl p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#6B7280] mb-6">Tracking Timeline</h3>
                
                <div className="space-y-6 relative">
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827]"></div>
                  
                  {trackingData.steps.map((step: any, idx: number) => (
                    <div key={idx} className="flex gap-4 relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.active ? 'bg-[#E8622C] shadow-[0_0_15px_rgba(255,153,51,0.5)]' :
                        step.completed ? 'bg-emerald-500' : 'bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827]'
                      }`}>
                        {step.completed && !step.active ? <CheckCircle size={14} className="text-[#111827]" /> : 
                         step.active ? <Truck size={14} className="text-[#111827]" /> : 
                         <div className="w-2 h-2 rounded-full bg-slate-600"></div>}
                      </div>
                      
                      <div className="pt-1.5 flex-1 pb-4 border-b border-slate-800/50">
                        <div className={`font-black uppercase tracking-widest text-sm ${step.active ? 'text-[#E8622C]' : step.completed ? 'text-[#111827]' : 'text-slate-500'}`}>
                          {step.status}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                          <Clock size={10} /> {step.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
