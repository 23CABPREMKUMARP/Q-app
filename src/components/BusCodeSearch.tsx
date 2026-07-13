"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bus, Search, QrCode, ArrowRight, Zap, History, MapPin, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface BusCodeSearchProps {
  onScanClick?: () => void;
  compact?: boolean;
}

export const BusCodeSearch = ({ onScanClick, compact = false }: BusCodeSearchProps) => {
  const [busCode, setBusCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentBuses, setRecentBuses] = useState<string[]>([]);
  const router = useRouter();

  const [suggestedBuses, setSuggestedBuses] = useState<any[]>([]);

  // Load recent searches and suggested buses
  useEffect(() => {
    const saved = localStorage.getItem("recentBusCodes");
    if (saved) {
      try {
        setRecentBuses(JSON.parse(saved));
      } catch (e) {
        setRecentBuses([]);
      }
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch("/api/buses");
        if (res.ok) {
          const data = await res.json();
          // Show 3 random active buses as suggestions
          setSuggestedBuses(data.slice(0, 3));
        }
      } catch (e) {}
    };
    fetchSuggestions();
  }, []);

  const saveToRecent = (code: string) => {
    const updated = [code, ...recentBuses.filter(c => c !== code)].slice(0, 3);
    setRecentBuses(updated);
    localStorage.setItem("recentBusCodes", JSON.stringify(updated));
  };

  const handleSearch = async (e?: React.FormEvent, manualCode?: string) => {
    if (e) e.preventDefault();
    const codeToSearch = manualCode || busCode;
    
    if (!codeToSearch.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const upperCode = codeToSearch.toUpperCase();
      const res = await fetch(`/api/buses/search?code=${upperCode}`);
      const data = await res.json();

      if (data.success && data.bus) {
        saveToRecent(upperCode);
        router.push(`/town-bus/bus/${data.bus.busCode}`);
      } else {
        setError("Invalid Bus Code. Check and try again.");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full ${compact ? "" : "max-w-xl mx-auto"} p-4`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[32px] bg-[#ffffff] shadow-2xl border border-zinc-100/50"
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-zinc-950 tracking-tight leading-none">Bus Quick-Code</h2>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2">Instant Fleet Access</p>
            </div>
            <div className="w-12 h-12 bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] rounded-2xl flex items-center justify-center shadow-lg">
              <Zap size={24} className="text-[#111827] fill-current" />
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search size={20} className="text-zinc-600 group-focus-within:text-zinc-950 transition-colors" />
            </div>
            <input
              type="text"
              value={busCode}
              onChange={(e) => setBusCode(e.target.value.toUpperCase())}
              placeholder="ENTER BUS CODE (e.g. 1024)"
              className="w-full bg-white border-2 border-zinc-100 rounded-2xl py-5 pl-12 pr-[76px] text-base md:text-xl font-black tracking-wide text-[#111827] placeholder:text-zinc-500 outline-none focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/10 transition-all uppercase"
            />
            <div className="absolute inset-y-2 right-2 flex items-center">
              <button
                type="submit"
                disabled={isLoading || !busCode}
                className="h-full px-4 w-14 justify-center bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#111827] rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center hover:bg-zinc-800 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-black/10"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={18} />}
              </button>
            </div>
            
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-6 left-0 right-0 text-[10px] font-black text-[#FF5F1F] uppercase tracking-widest text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </form>

          {recentBuses.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 mr-2">
                <History size={14} className="text-zinc-300" />
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Recent</span>
              </div>
              {recentBuses.map((code) => (
                <button
                  key={code}
                  onClick={() => handleSearch(undefined, code)}
                  className="px-4 py-2 bg-white hover:bg-zinc-100 border border-zinc-100 rounded-full text-[10px] font-bold text-zinc-600 uppercase tracking-widest transition-all hover:scale-105"
                >
                  {code}
                </button>
              ))}
            </div>
          )}

          {suggestedBuses.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 mr-2">
                <MapPin size={14} className="text-primary/40" />
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Quick Picks</span>
              </div>
              {suggestedBuses.map((bus) => (
                <button
                  key={bus._id}
                  onClick={() => handleSearch(undefined, bus.busCode)}
                  className="px-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Bus size={10} /> {bus.busCode}
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center justify-between">
            <button 
              onClick={onScanClick || (() => router.push('/live-map?action=scan'))}
              className="flex items-center gap-3 text-zinc-600 hover:text-zinc-950 transition-colors group"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:bg-zinc-100 transition-all">
                <QrCode size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Scan QR Matrix</span>
            </button>
            <div className="flex items-center gap-2 text-zinc-300">
               <MapPin size={12} />
               <span className="text-[8px] font-bold uppercase tracking-widest">Regional Fleet Access</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
