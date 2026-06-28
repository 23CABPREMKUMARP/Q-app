"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Phone, Search, Loader2, Ticket, MapPin, Clock, Calendar, QrCode, ShieldCheck, Download, Zap, X, ChevronRight, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { BusCodeSearch } from "@/src/components/BusCodeSearch";
import { WatermarkOverlay } from "@/src/components/ui/WatermarkOverlay";
import SecureView from "@/src/components/SecureView";

export default function GetTicketPage() {
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(Date.now());


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

  return (
    <SecureView>
      <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28 pt-20 overflow-x-hidden safe-bottom secure-content">
      <WatermarkOverlay text={`SECURE TICKET ${phone}`} />
      
      {/* Native Mobile Top Bar */}
      <div className="bg-white border-b border-slate-100 py-6 px-6 fixed top-0 left-0 right-0 z-40 shadow-sm flex items-center gap-3">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl transition-all">
          <ChevronRight className="rotate-180 text-slate-600" size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">My Passes</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metropolitan Transit Passbook</p>
        </div>
      </div>

      <div className="max-w-xl md:max-w-4xl mx-auto px-5 pt-8 space-y-6">
        
        {/* Intro Panel */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF9933]/10 border border-[#FF9933]/20 text-[#FF9933] text-[9px] font-black uppercase tracking-wider"
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
              className="w-full bg-white border border-slate-200 rounded-2xl py-4.5 pl-13 pr-28 focus:outline-none focus:ring-4 focus:ring-[#FF9933]/10 focus:border-[#FF9933] transition-all text-sm font-bold tracking-wide placeholder:text-slate-300 text-slate-900 shadow-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-slate-950 hover:bg-[#FF9933] text-white px-5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
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

        {/* Results list */}
        <div className="space-y-6">
          {searched && !loading && bookings.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-sm mx-auto space-y-4"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 text-slate-300">
                <Ticket size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">No Passes Found</h3>
                <p className="text-slate-400 text-[11px] font-semibold max-w-[200px] mx-auto leading-relaxed">We could not find any active tickets linked with this node.</p>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {bookings.length > 0 && (
              <div className="space-y-6">
                {bookings.map((booking, idx) => {
                  const bookingTime = booking.bookingDate ? new Date(booking.bookingDate).getTime() : Date.now();
                  const expiryTime = bookingTime + 7200000; // 2 hours
                  const isExpired = currentTime > expiryTime;
                  const timeRemainingMs = expiryTime - currentTime;
                  
                  let timeRemainingStr = "";
                  if (!isExpired) {
                     const hours = Math.floor(timeRemainingMs / 3600000);
                     const mins = Math.floor((timeRemainingMs % 3600000) / 60000);
                     const secs = Math.floor((timeRemainingMs % 60000) / 1000);
                     if (hours > 0) timeRemainingStr = `${hours}h ${mins}m ${secs}s`;
                     else timeRemainingStr = `${mins}m ${secs}s`;
                  }

                  return (
                  <motion.div
                    key={booking.id || booking._id || `booking-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`w-full overflow-hidden flex flex-col items-center justify-center py-4 ${isExpired ? "opacity-75 grayscale-[0.5]" : ""}`}
                  >
                    {/* Vintage Ornate Gold Ticket Design (Horizontal Landscape Layout matching Live Map) */}
                    <div 
                      id={`printable-ticket-${idx}`}
                      className={`ticket-container relative bg-[#f7e49f] bg-gradient-to-br from-[#f7e49f] via-[#e5c167] to-[#d4af37] rounded-[20px] md:rounded-[40px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] overflow-hidden border-[6px] md:border-[12px] flex flex-col md:flex-row min-h-[500px] md:min-h-[380px] w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-left ${isExpired ? "border-red-500/80" : "border-green-500/80"}`}
                    >
                      <div className="absolute inset-0 opacity-100 mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] print:opacity-50" />
                      <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]" />
                      <div className="absolute inset-0 border-[6px] border-[#d4af37] opacity-80 pointer-events-none" />
                      
                      {/* Left Side: Main Info */}
                      <div className="p-6 md:p-10 flex-1 relative border-b-4 md:border-b-0 md:border-r-4 border-dashed border-[#b8860b]/40">
                        <div className="relative z-10 text-center mb-8">
                          <div className="flex items-center justify-center gap-4 mb-3">
                            <Image src="/logo2.png" alt="JeffBen" width={32} height={32} className="object-contain" />
                            <div className="h-6 w-[1px] bg-[#5d4037]/25" />
                            <Image src="/hero-logo.png" alt="Digi Bus Stand" width={32} height={32} className="object-contain mix-blend-multiply" />
                          </div>
                          <p className="text-[8px] font-black text-[#5d4037]/50 uppercase tracking-[0.4em] mb-1">Digi Bus Stand Framework</p>
                          <p className="text-base font-vintage text-[#5d4037]/80 leading-none mb-1">Powered by <span className="text-black">Jeff</span>Ben</p>
                          <h3 className="text-2xl md:text-4xl font-serif font-black tracking-tight text-[#5d4037] leading-none uppercase">Digi Bus Stand Ticket</h3>
                          
                          {/* Validity Status Badge */}
                          <div className="mt-4 flex flex-col items-center justify-center gap-1">
                            <div className={`px-4 py-1.5 rounded-full border-2 inline-flex items-center gap-2 ${isExpired ? "bg-red-100 border-red-500 text-red-700" : "bg-green-100 border-green-500 text-green-700"}`}>
                              {!isExpired && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                              <span className="font-bold text-xs uppercase tracking-widest">{isExpired ? "Expired" : "Valid"}</span>
                            </div>
                            {!isExpired ? (
                              <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">
                                Expires in {timeRemainingStr}
                              </p>
                            ) : (
                              <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest">
                                Ticket Validity Ended
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4 text-left relative z-10 px-2 text-[#5d4037]">
                          <div className="grid grid-cols-2 gap-4 border-b border-[#5d4037]/20 pb-3">
                            <div className="flex flex-col">
                              <span className="font-sans font-bold uppercase text-[9px] tracking-[0.2em] text-[#5d4037]/60">Bus No:</span>
                              <span className="text-lg font-serif font-black tracking-tight uppercase">{booking.busId?.busNumber || "TN-38"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-sans font-bold uppercase text-[9px] tracking-[0.2em] text-[#5d4037]/60">Passengers:</span>
                              <span className="text-lg font-serif font-black tracking-tight">{booking.seats?.length || 1} {booking.passengers?.[0]?.luggage && booking.passengers[0].luggage !== 'None' ? <span className="text-xs uppercase tracking-widest text-[#5d4037]/70 ml-1">(+ {booking.passengers[0].luggage} Luggage)</span> : null}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-b border-[#5d4037]/20 pb-3">
                            <div className="flex flex-col">
                              <span className="font-sans font-bold uppercase text-[9px] tracking-[0.2em] text-[#5d4037]/60">Boarding</span>
                              <p className="text-sm font-serif font-bold uppercase truncate max-w-[120px]">{booking.boardingPoint || "Point A"}</p>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-sans font-bold uppercase text-[9px] tracking-[0.2em] text-[#5d4037]/60">Destination</span>
                              <p className="text-sm font-serif font-bold uppercase truncate max-w-[120px]">{booking.destination || "Point B"}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[#5d4037]/75">
                            <div className="flex flex-col">
                              <span className="font-sans font-bold uppercase text-[8px] tracking-[0.2em] text-[#5d4037]/60">Travel Date</span>
                              <span className="text-xs font-bold">{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="text-right bg-[#5d4037]/5 px-3 py-1.5 rounded-xl border border-[#5d4037]/15">
                              <span className="font-sans font-bold uppercase text-[8px] tracking-[0.2em] text-[#5d4037]/60 block mb-0.5">Total Fare</span>
                              <p className="text-sm font-serif font-black text-slate-950">₹{booking.totalAmount}</p>
                            </div>
                          </div>
                          
                          {booking.phonepeTransactionId && (
                            <div className="mt-4 pt-3 border-t border-[#5d4037]/10 flex items-center justify-between">
                               <div className="flex items-center gap-1.5">
                                 <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                                   <span className="font-black text-purple-600 text-[8px]">Pe</span>
                                 </div>
                                 <span className="text-[8px] font-bold text-[#5d4037]/60 uppercase tracking-widest">PhonePe Confirmed</span>
                               </div>
                               <span className="text-[9px] font-bold text-[#5d4037]/80 uppercase tracking-widest">TXN: {booking.phonepeTransactionId}</span>
                            </div>
                          )}

                          {/* Track Bus Button */}
                          <div className="mt-4 pt-4 border-t border-[#5d4037]/20 flex justify-center">
                            {!isExpired && booking.busId ? (
                              <Link
                                href={`/live-map?busId=${booking.busId._id || booking.busId}`}
                                className="w-full bg-[#FF9933] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30"
                              >
                                <MapPin size={14} />
                                Track Bus Live
                              </Link>
                            ) : (
                              <div className="w-full bg-slate-200 text-slate-500 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                <Clock size={14} />
                                {isExpired ? "Tracking Ended" : "Live tracking is currently unavailable for this bus."}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: QR Secure Matrix */}
                      <div className="p-6 md:p-8 md:w-[240px] flex flex-col justify-between items-center relative overflow-hidden bg-black/5">
                        <div className="p-3 bg-[#b8860b]/10 rounded-2xl shadow-inner border-2 border-[#b8860b]/30 relative overflow-hidden group bg-white/20">
                          {isExpired && (
                            <div className="absolute inset-0 z-20 bg-red-500/20 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg -rotate-12 border border-red-400">EXPIRED</span>
                            </div>
                          )}
                          {/* Secure Watermark Layer */}
                          <div className="absolute inset-0 opacity-[0.2] pointer-events-none flex flex-wrap gap-2 items-center justify-center text-[5px] font-black uppercase tracking-tighter text-[#5d4037] -rotate-12 scale-110">
                            {Array(15).fill(null).map((_, i) => (
                              <span key={i} className="whitespace-nowrap">DIGI BUS •</span>
                            ))}
                          </div>
                          <QRCodeSVG 
                            value={booking.qrToken || "INVALID"} 
                            size={120} 
                            fgColor="#2d1a12" 
                            bgColor="transparent"
                            level="H" 
                            imageSettings={{
                              src: "/hero-logo.png",
                              height: 28,
                              width: 28,
                              excavate: true,
                            }}
                          />
                        </div>
                        <div className="text-center mt-4">
                          <p className="text-[8px] font-bold text-[#5d4037]/50 uppercase tracking-widest leading-none mb-1">Serial Key</p>
                          <p className="text-xs font-serif font-black text-[#5d4037]">JB-{booking.ticketId?.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>

                      {/* Side Notches */}
                      <div className="hidden md:block absolute left-[240px] top-0 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 border border-slate-100/50" />
                      <div className="hidden md:block absolute left-[240px] bottom-0 translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 border border-slate-100/50" />
                    </div>

                  </motion.div>
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
              className="w-full h-14 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              Launch Live Map <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </main>
    </SecureView>
  );
}


// End of passes view


