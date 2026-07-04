"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bus, MapPin, Clock, ArrowRight, Activity, Zap, Loader2, Info } from "lucide-react";
import Link from "next/link";

export default function BusCodeDetailsPage() {
  const { busCode } = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!busCode) return;
    const fetchTrip = async () => {
      try {
        const res = await fetch(`/api/town-bus/current-trip?busCode=${busCode}`);
        const data = await res.json();
        if (res.ok && data._id) {
          setTrip(data);
        } else {
          setError(data.error || "No active trips found for this bus.");
        }
      } catch (err) {
        setError("Network error fetching bus details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [busCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#18D2C7]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-24">
      {/* Header */}
      <div className="bg-[#18D2C7] px-6 pt-12 pb-24 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <button onClick={() => router.back()} className="bg-[#ffffff]/20 p-2 rounded-xl backdrop-blur-md">
            <ArrowRight size={24} className="text-black rotate-180" />
          </button>
          <div className="bg-[#ffffff]/20 p-2 rounded-xl backdrop-blur-md px-4 flex items-center gap-2">
            <Bus size={18} className="text-black" />
            <span className="text-black font-black tracking-widest">{busCode}</span>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-16 relative z-20 max-w-md mx-auto">
        {error ? (
          <div className="bg-[#ffffff] p-8 rounded-3xl shadow-xl text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Info size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800 uppercase">Bus Not Active</h2>
            <p className="text-sm font-bold text-slate-600">{error}</p>
            <button onClick={() => router.push('/')} className="mt-4 px-6 py-3 bg-[#ffffff] border border-slate-200 shadow-sm text-black text-black rounded-xl font-black uppercase text-xs tracking-widest w-full">Back to Home</button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Bus Info Card */}
            <div className="bg-[#ffffff] rounded-3xl p-6 shadow-xl border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Bus size={120} />
              </div>
              <div className="relative z-10">
                <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Route Info</h2>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-6">
                  {trip.routeId?.routeName || "City Route"}
                </h3>

                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center"><Clock size={16} /></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Departure</p>
                        <p className="font-bold text-slate-800">{trip.departureTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Fare</p>
                        <p className="font-bold text-slate-800">₹{trip.fare}</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center"><Zap size={16} /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href={`/town-bus/${trip._id}/seat-selection`}
                className="bg-[#ffffff] border border-slate-200 shadow-sm text-black text-black p-5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
              >
                <div className="w-10 h-10 rounded-full bg-[#ffffff] border border-slate-200 text-black flex items-center justify-center">
                  <Bus size={20} className="text-[#18D2C7]" />
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest">Book Ticket</span>
              </Link>
              
              <Link 
                href={`/live-map?busId=${trip.busId}`}
                className="bg-[#ffffff] border border-slate-200 text-slate-900 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-[#ffffff] active:scale-95 transition-all shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <MapPin size={20} className="text-emerald-500" />
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest">Track GPS</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
