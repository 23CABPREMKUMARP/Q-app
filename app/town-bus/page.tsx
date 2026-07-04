"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Clock, Filter, Bus, Navigation, Users, Zap, ArrowRight, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MOCK_BUSES } from "@/src/lib/constants";
import { QRCodeSVG } from 'qrcode.react';
import SecureView from "@/src/components/SecureView";

export default function TownBusSearchPage() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [expandedQR, setExpandedQR] = useState<string | null>(null);
  const [hasRestoredScroll, setHasRestoredScroll] = useState(false);

  const allStops = Array.from(new Set(MOCK_BUSES.flatMap(b => b.routeId?.stops?.map((s: any) => s.stopName) || [])));
  
  const fromSuggestions = allStops.filter(s => s.toLowerCase().includes(from.toLowerCase()));
  const toSuggestions = allStops.filter(s => s.toLowerCase().includes(to.toLowerCase()));

  // Restore search state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const savedStateStr = sessionStorage.getItem('townBusSearchState');
        if (savedStateStr) {
          try {
            const savedState = JSON.parse(savedStateStr);
            setFrom(savedState.from || '');
            setTo(savedState.to || '');
            setDate(savedState.date || '');
            setResults(savedState.results || []);
            setHasSearched(savedState.hasSearched || false);
          } catch (e) {
            console.error('Error restoring town bus search state:', e);
          }
        }
    }
  }, []);

  // Restore scroll position after results are loaded
  useEffect(() => {
    if (results.length > 0 && !hasRestoredScroll) {
      if (typeof window !== 'undefined') {
        const savedScrollY = sessionStorage.getItem('townBusScrollY');
        if (savedScrollY) {
          const y = parseInt(savedScrollY, 10);
          if (!isNaN(y) && y > 0) {
            const timer = setTimeout(() => {
              window.scrollTo(0, y);
              setHasRestoredScroll(true);
            }, 150);
            return () => clearTimeout(timer);
          }
        }
        setHasRestoredScroll(true);
      }
    }
  }, [results, hasRestoredScroll]);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (results.length > 0 && typeof window !== 'undefined') {
        sessionStorage.setItem('townBusScrollY', window.scrollY.toString());
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [results]);

  const handleClearSearch = () => {
    setFrom('');
    setTo('');
    setResults([]);
    setHasSearched(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('townBusSearchState');
      sessionStorage.removeItem('townBusScrollY');
    }
  };

  const handleLocationChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      setFrom(value);
    } else {
      setTo(value);
    }
    // Clear results on location change
    setResults([]);
    setHasSearched(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('townBusSearchState');
      sessionStorage.removeItem('townBusScrollY');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const res = await fetch(`/api/town-bus/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      const data = await res.json();
      const trips = data.trips || [];
      setResults(trips);
      
      // Save search state
      if (typeof window !== 'undefined') {
        const stateToSave = {
          from,
          to,
          date,
          results: trips,
          hasSearched: true
        };
        sessionStorage.setItem('townBusSearchState', JSON.stringify(stateToSave));
        sessionStorage.setItem('townBusScrollY', '0');
        setHasRestoredScroll(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <SecureView>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-24">
        {/* Header */}
      <div className="bg-[#A4E5E0] px-6 pt-12 pb-8 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-black">Town Bus</h1>
            <div className="bg-[#ffffff]/20 p-2 rounded-xl backdrop-blur-md">
              <Bus size={24} className="text-black" />
            </div>
          </div>
          <p className="text-black/80 font-medium text-sm tracking-wide">Premium City Transit & Express Routes</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="px-6 -mt-6 relative z-20">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#ffffff] rounded-3xl p-6 shadow-xl shadow-black/20 text-slate-900 border border-slate-100"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-3 relative">
              {/* Vertical line connector */}
              <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-slate-200 border-l-2 border-dashed border-slate-300"></div>
              
              <div className="relative">
                <div className="flex items-center gap-4 bg-[#ffffff] p-4 rounded-2xl border border-slate-100 focus-within:border-[#A4E5E0] transition-colors relative z-10">
                  <MapPin size={20} className="text-emerald-500" />
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Boarding Point</label>
                    <input 
                      type="text" 
                      placeholder="E.g. Gandhipuram"
                      value={from}
                      onChange={(e) => { handleLocationChange('from', e.target.value); setShowFromSuggestions(true); }}
                      onFocus={() => setShowFromSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
                      required
                    />
                  </div>
                </div>
                {showFromSuggestions && from && fromSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#ffffff] rounded-2xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto z-50">
                    {fromSuggestions.map((stop, i) => (
                      <div 
                        key={i} 
                        onClick={() => { handleLocationChange('from', stop); setShowFromSuggestions(false); }}
                        className="px-4 py-3 hover:bg-[#ffffff] cursor-pointer text-sm font-bold text-slate-700 border-b border-slate-50 last:border-0"
                      >
                        {stop}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="flex items-center gap-4 bg-[#ffffff] p-4 rounded-2xl border border-slate-100 focus-within:border-[#A4E5E0] transition-colors relative z-10">
                  <Navigation size={20} className="text-red-500" />
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Drop Point</label>
                    <input 
                      type="text" 
                      placeholder="E.g. Ukkadam"
                      value={to}
                      onChange={(e) => { handleLocationChange('to', e.target.value); setShowToSuggestions(true); }}
                      onFocus={() => setShowToSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
                      required
                    />
                  </div>
                </div>
                {showToSuggestions && to && toSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#ffffff] rounded-2xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto z-50">
                    {toSuggestions.map((stop, i) => (
                      <div 
                        key={i} 
                        onClick={() => { handleLocationChange('to', stop); setShowToSuggestions(false); }}
                        className="px-4 py-3 hover:bg-[#ffffff] cursor-pointer text-sm font-bold text-slate-700 border-b border-slate-50 last:border-0"
                      >
                        {stop}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSearching}
              className="w-full bg-[#A4E5E0] text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg shadow-[#A4E5E0]/20 active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-[#ffffff]/30 border-t-[#ffffff] rounded-full animate-spin"></div>
              ) : (
                <>Search Buses <Search size={18} /></>
              )}
            </button>
            {hasSearched && (
              <button 
                type="button"
                onClick={handleClearSearch}
                className="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors active:scale-95 flex items-center justify-center gap-2 mt-2 border border-slate-200/50"
              >
                Clear Search
              </button>
            )}
          </form>
        </motion.div>
      </div>

      {/* Results */}
      <div className="px-6 mt-8">
        <AnimatePresence>
          {hasSearched && !isSearching && results.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bus size={32} className="text-zinc-500" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest text-zinc-900 mb-2">No Buses Found</h3>
              <p className="text-sm text-slate-500">Try changing your route or date.</p>
            </motion.div>
          )}

          {results.map((trip: any, idx: number) => (
            <motion.div 
              key={trip._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#ffffff] rounded-3xl p-5 mb-4 border border-zinc-100 relative overflow-hidden group hover:border-[#A4E5E0]/50 transition-colors cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => router.push(`/town-bus/${trip._id}/seat-selection`)}
            >

              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 mb-1">
                    {trip.routeId?.routeName || "City Express"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider border border-slate-200">
                      {trip.busId?.busNumber || "TBA"}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 ${
                      trip.crowdStatus === 'Low' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' :
                      trip.crowdStatus === 'Medium' ? 'text-yellow-600 bg-yellow-50 border border-yellow-100' :
                      'text-red-600 bg-red-50 border border-red-100'
                    }`}>
                      <Users size={12} /> {trip.crowdStatus} Crowd
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="text-[#A4E5E0] font-black text-2xl tracking-tighter">₹{trip.fare}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Per Seat</div>
                  
                  {/* Bus Code & QR Section */}
                  {(trip.busId?.busCode || trip.busId?.qrCodeUrl) && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); setExpandedQR(expandedQR === trip._id ? null : trip._id); }}
                      className="flex items-center gap-2 mt-1 bg-[#ffffff] p-1.5 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      {trip.busId.busCode && (
                        <div className="bg-[#ffffff] p-1 rounded-md shadow-sm border border-slate-100">
                          <QRCodeSVG 
                            value={`https://jeffben.org/bus/${trip.busId.busCode}`} 
                            size={32} 
                            level="L" 
                          />
                        </div>
                      )}
                      <div className="text-right">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block leading-none mb-1">Bus Code</span>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{trip.busId.busCode}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded QR Modal/Section */}
              <AnimatePresence>
                {expandedQR === trip._id && trip.busId?.busCode && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full mb-4 flex flex-col items-center justify-center bg-[#ffffff] p-6 rounded-2xl border border-slate-200 shadow-inner"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-[#ffffff] p-3 rounded-xl shadow-sm border border-slate-100 mb-4">
                      <QRCodeSVG value={`https://jeffben.org/bus/${trip.busId.busCode}`} size={160} level="H" />
                    </div>
                    <p className="text-xl font-black text-slate-900 uppercase tracking-widest">{trip.busId.busCode}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center mt-2">Scan this code while boarding to book instantly</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-[#ffffff] border border-slate-200 shadow-sm text-black rounded-[24px] p-4 flex items-center justify-between relative overflow-hidden group mb-4">
                <div className="absolute inset-y-0 left-0 w-1 bg-[#A4E5E0]" />
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Boarding</span>
                  <span className="text-sm font-black text-black uppercase truncate max-w-[120px]">{from || "Start"}</span>
                </div>
                <div className="flex-1 flex flex-col items-center px-4">
                  <div className="w-full h-[1px] bg-[#ffffff] border border-slate-200 shadow-sm text-black relative">
                    <div className="absolute inset-0 bg-[#A4E5E0] animate-pulse" />
                    <ArrowRight size={14} className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[#A4E5E0]" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Destination</span>
                  <span className="text-sm font-black text-black uppercase truncate max-w-[120px]">{to || "End"}</span>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-4 flex items-center justify-between border border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-zinc-600">{trip.availableSeats} Seats Left</span>
                </div>
                <button className="bg-[#A4E5E0] hover:bg-orange-600 text-black px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 shadow-lg shadow-[#A4E5E0]/20">
                  Select Tickets <Navigation size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isSearching && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#ffffff] rounded-3xl p-5 border border-zinc-100 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="w-40 h-8 bg-zinc-100 rounded-lg"></div>
                  <div className="w-16 h-8 bg-zinc-100 rounded-lg"></div>
                </div>
                <div className="w-full h-16 bg-zinc-100 rounded-2xl mb-4"></div>
                <div className="w-full h-12 bg-zinc-50 rounded-2xl"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </SecureView>
  );
}
