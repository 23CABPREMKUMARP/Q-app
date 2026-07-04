"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Phone, Search, Loader2, Ticket, MapPin, Clock, Calendar, QrCode, ShieldCheck, Download, Zap, X, ChevronRight, CheckCircle2, Filter } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { BusCodeSearch } from "@/src/components/BusCodeSearch";
import { WatermarkOverlay } from "@/src/components/ui/WatermarkOverlay";
import { PremiumBoardingPass } from "@/src/components/PremiumBoardingPass";
import SecureView from "@/src/components/SecureView";

export default function GetTicketPage() {
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // New States for List View & Modal
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL', 'ACTIVE', 'EXPIRED'
  const [selectedTicket, setSelectedTicket] = useState<any>(null);


  // Pre-load phone number from localStorage if present
  useEffect(() => {
    const savedPhone = localStorage.getItem("registeredPhone");
    if (savedPhone) {
      setPhone(savedPhone);
      // Auto trigger fetch
      fetchBookings(savedPhone);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchBookings = async (phoneNum: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/bookings/by-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNum }),
      });

      if (res.ok) {
        const data = await res.json();
        let paidBookings = data.filter((b: any) => !b.paymentStatus || b.paymentStatus === "Paid");
        
        // Sort bookings: Valid first, closest to expiring first. Expired last.
        paidBookings.sort((a: any, b: any) => {
          const aTime = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
          const bTime = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
          const aExpired = Date.now() > aTime + 7200000;
          const bExpired = Date.now() > bTime + 7200000;
          
          if (aExpired && !bExpired) return 1;
          if (!aExpired && bExpired) return -1;
          return bTime - aTime;
        });

        setBookings(paidBookings);
        setDiagnostics(`Sync active. Cluster queried. Found ${paidBookings.length} active passes.`);
        localStorage.setItem("registeredPhone", phoneNum);
      } else {
        setDiagnostics("Network Link Error: Structural failure.");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    fetchBookings(phone);
  };

  // Filter Logic
  const filteredBookings = bookings.filter((booking) => {
    const bookingTime = booking.bookingDate ? new Date(booking.bookingDate).getTime() : Date.now();
    const expiryTime = bookingTime + 7200000;
    const isExpired = currentTime > expiryTime;
    
    // Status Filter
    if (statusFilter === 'ACTIVE' && isExpired) return false;
    if (statusFilter === 'EXPIRED' && !isExpired) return false;
    
    // Search Query (Bus Number, Booking ID, Route)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const busNum = (booking.busId?.busNumber || booking.busNumber || "").toLowerCase();
      const ticketId = (booking.ticketId || "").toLowerCase();
      const boarding = (booking.boardingPoint || "").toLowerCase();
      const dest = (booking.destination || "").toLowerCase();
      
      if (!busNum.includes(query) && !ticketId.includes(query) && !boarding.includes(query) && !dest.includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <SecureView>
      <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28 pt-20 overflow-x-hidden safe-bottom secure-content">
      <WatermarkOverlay text={`SECURE TICKET ${phone}`} />
      
      {/* Native Mobile Top Bar */}
      <div className="bg-[#ffffff] border-b border-slate-100 py-6 px-6 fixed top-0 left-0 right-0 z-40 shadow-sm flex items-center gap-3">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl transition-all">
          <ChevronRight className="rotate-180 text-slate-600" size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">My Passes</h1>
          <p className="text-[10px] font-bold ${isExpired ? 'text-slate-400' : 'text-black/70'} uppercase tracking-wider">Metropolitan Transit Passbook</p>
        </div>
      </div>

      <div className="max-w-xl md:max-w-4xl mx-auto px-5 pt-8 space-y-6">
        
        {/* Intro Panel */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A4E5E0]/10 border border-[#A4E5E0]/20 text-[#A4E5E0] text-[9px] font-black uppercase tracking-wider"
          >
            <ShieldCheck size={12} /> Secure Encryption Node
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-black tracking-tight text-slate-950 uppercase"
          >
            Retrieve Passes
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-xs font-semibold max-w-xs mx-auto leading-relaxed"
          >
            Enter your registered mobile number to fetch, sync, and display your digital passes.
          </motion.p>
        </div>

        {/* Input Search Form */}
        <motion.form 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSearch}
          className="w-full relative"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">
              <Phone size={18} />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-Digit Mobile Number"
              className="w-full bg-[#ffffff] border border-slate-200 rounded-2xl py-4.5 pl-13 pr-28 focus:outline-none focus:ring-4 focus:ring-[#A4E5E0]/10 focus:border-[#A4E5E0] transition-all text-sm font-bold tracking-wide placeholder:text-slate-300 text-slate-900 shadow-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-slate-950 hover:bg-[#A4E5E0] text-[#ffffff] px-5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
            >
              {loading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <>
                  <Search size={14} />
                  <span>Sync</span>
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Results Filters (Only show if bookings exist) */}
        {bookings.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by ID, Bus, or Route..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#ffffff] border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${statusFilter === 'ALL' ? 'bg-slate-800 text-[#ffffff] border-slate-800' : 'bg-[#ffffff] text-slate-600 border-slate-200'}`}
              >
                All Passes
              </button>
              <button 
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${statusFilter === 'ACTIVE' ? 'bg-green-600 text-[#ffffff] border-green-600' : 'bg-[#ffffff] text-slate-600 border-slate-200'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setStatusFilter('EXPIRED')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${statusFilter === 'EXPIRED' ? 'bg-red-600 text-[#ffffff] border-red-600' : 'bg-[#ffffff] text-slate-600 border-slate-200'}`}
              >
                Expired
              </button>
            </div>
          </motion.div>
        )}

        {/* Results list */}
        <div className="space-y-6">
          {searched && !loading && filteredBookings.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-[#ffffff] rounded-3xl border border-slate-100 shadow-sm max-w-sm mx-auto space-y-4"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 text-slate-300">
                <Ticket size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold ${isExpired ? 'text-slate-800' : 'text-black'} uppercase tracking-tight">No Passes Found</h3>
                <p className="text-slate-400 text-[11px] font-semibold max-w-[200px] mx-auto leading-relaxed">We could not find any active tickets matching your criteria.</p>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {filteredBookings.length > 0 && (
              <div className="space-y-3">
                {filteredBookings.map((booking, idx) => {
                  const bookingTime = booking.bookingDate ? new Date(booking.bookingDate).getTime() : Date.now();
                  const expiryTime = bookingTime + 7200000; // 2 hours
                  const isExpired = currentTime > expiryTime;
                  
                  const boarding = booking.boardingPoint || "Point A";
                  const destination = booking.destination || "Point B";
                  const dateObj = new Date(bookingTime);
                  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const busNumber = booking.busNumber || booking.busId?.busNumber || "TOWN-BUS";
                  const ticketId = booking.ticketId?.toUpperCase() || "PENDING";
                  const amount = booking.totalAmount || 0;

                  return (
                    <div key={booking.id || booking._id || `booking-${idx}`}>
                      {/* Mobile View: Compact Banner */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedTicket(booking)}
                        className={`w-full border ${isExpired ? 'bg-slate-50 border-slate-200' : 'bg-gradient-to-br from-[#FFD700] via-[#FFF3B0] to-[#D4AF37] border-[#B8860B] shadow-lg shadow-[#D4AF37]/40'} rounded-xl p-4 cursor-pointer hover:scale-[1.01] transition-transform active:scale-95 flex flex-col gap-3 relative overflow-hidden`}
                  >
                    {/* Left Accent Bar */}
                    {isExpired && <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300"></div>}
                    
                    <div className="flex justify-between items-start ml-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold ${isExpired ? 'text-slate-400' : 'text-black/70'} uppercase">{dateStr}</span>
                        <div className="font-bold ${isExpired ? 'text-slate-800' : 'text-black'} text-sm flex items-center gap-1.5 mt-1">
                          <span className="truncate max-w-[100px]">{boarding}</span>
                          <ArrowLeft size={12} className="rotate-180 ${isExpired ? 'text-slate-400' : 'text-black/50'} shrink-0" />
                          <span className="truncate max-w-[100px]">{destination}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${isExpired ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                        {isExpired ? 'Expired' : 'Active'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between ml-2 pt-3 border-t border-slate-100 mt-1">
                      <div className="flex items-center gap-3">
                        <div className="${isExpired ? 'bg-slate-100' : 'bg-black/10'} px-2 py-1 rounded-md text-[10px] font-bold ${isExpired ? 'text-slate-600' : 'text-black'} flex items-center gap-1">
                           🚌 {busNumber}
                        </div>
                        <div className="text-[10px] font-mono font-bold ${isExpired ? 'text-slate-500' : 'text-black/80'}">
                          {ticketId}
                        </div>
                      </div>
                      <div className="text-sm font-black ${isExpired ? 'text-slate-800' : 'text-black'}">
                        ₹{amount}
                      </div>
                    </div>
                  </motion.div>
                      
                      
                    </div>
                  )})}
              </div>
            )}
          </AnimatePresence>

          {/* Diagnostic Sync plate */}
          <div className="border-t border-slate-100 pt-6 text-center">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-3">Bus stand Sync Node</p>
            <div className="inline-flex items-center gap-2 bg-slate-100/50 px-4 py-2 rounded-xl border border-slate-100">
              <div className={`w-1.5 h-1.5 rounded-full ${diagnostics ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{diagnostics || "Ready for sync signal"}</span>
            </div>
          </div>

          <div className="pt-8 space-y-3">
            <div className="text-center">
              <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">Need a new Pass?</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Get passes via GPS mapping engine</p>
            </div>
            <Link 
              href="/live-map" 
              className="w-full h-14 bg-gradient-to-br from-orange-500 to-amber-500 text-[#ffffff] rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              Launch Live Map <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
      
      {/* FULL TICKET MODAL */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          >
            <div className="absolute inset-0" onClick={() => setSelectedTicket(null)}></div>
            
            <div className="w-full max-w-4xl flex justify-end mb-4 relative z-10">
              <button 
                onClick={() => setSelectedTicket(null)}
                className="bg-[#ffffff]/20 hover:bg-[#ffffff]/40 text-[#ffffff] rounded-full p-2 backdrop-blur-md transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-[750px] md:w-max flex justify-center items-center relative z-10 transform rotate-90 md:rotate-0 origin-center scale-[0.95] sm:scale-[1] md:scale-100 transition-transform"
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside ticket from closing modal
            >
              <PremiumBoardingPass booking={selectedTicket} currentTime={currentTime} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 relative z-10 text-[#ffffff] text-xs font-bold uppercase tracking-widest opacity-70"
            >
              Tap outside to close
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </main>
    </SecureView>
  );
}
