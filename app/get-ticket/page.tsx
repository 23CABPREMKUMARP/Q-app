"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Phone, Search, Loader2, Ticket, MapPin, Clock, Calendar, QrCode, ShieldCheck, Download, Zap, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import dynamic from "next/dynamic";

export default function GetTicketPage() {
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string>("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/bookings/by-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(data);
        setDiagnostics(`Search complete. Clusters queried. Found ${data.length} matches across all nodes.`);
      } else {
        setDiagnostics("Network Link Error: The transit hub returned a structural failure.");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-[#FF9933] selection:text-white relative overflow-x-hidden">
      {/* Background Ornaments */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#FF9933] rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#FF9933] rounded-full blur-[100px] opacity-10" />
      </div>

      <div className="relative z-10 w-full min-h-screen border-t-[8px] border-[#FF9933]">

      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-10">
        <Link href="/" className="group flex items-center gap-3 bg-zinc-50 hover:bg-zinc-100 px-5 py-2.5 rounded-2xl transition-all border border-zinc-100 shadow-sm">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform text-zinc-900" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Back</span>
        </Link>
        <Image src="/logo2.png" alt="Logo" width={250} height={100} className="h-12 md:h-24 w-auto object-contain" />
        <div className="w-10" /> {/* Spacer */}
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-12 pb-32 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF9933]/10 border border-[#FF9933]/20 text-[#FF9933] text-[10px] font-bold uppercase tracking-widest"
          >
            <ShieldCheck size={14} /> Secure Access
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight uppercase text-zinc-900"
          >
            Retrieve Your <span className="text-[#FF9933]">Pass</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-sm md:text-lg max-w-lg mx-auto font-medium"
          >
            Enter your active phone number to synchronize with the JeffBen fleet matrix.
          </motion.p>
        </div>

        {/* Search Form */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSearch}
          className="max-w-md mx-auto mb-20 group"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-[#FF9933] transition-colors">
              <Phone size={20} />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter Phone Number"
              className="w-full bg-white border border-zinc-200 rounded-[32px] py-6 pl-16 pr-32 focus:outline-none focus:ring-4 focus:ring-[#FF9933]/10 focus:border-[#FF9933] transition-all text-lg font-bold tracking-tight placeholder:text-zinc-300 text-zinc-900 shadow-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-[#FF9933] hover:bg-zinc-900 text-white px-8 rounded-[24px] font-bold text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#FF9933]/20"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-[8px] opacity-70">powered by Jeff Ben</span>
                </div>
              ) : (
                <>
                  <Search size={18} />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Results Area */}
        <div className="space-y-12">
          {searched && !loading && bookings.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 bg-white rounded-[48px] border border-zinc-100 border-dashed max-w-2xl mx-auto shadow-sm"
            >
              <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-zinc-100">
                <Ticket size={40} className="text-zinc-200" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 tracking-tight uppercase mb-2">Matrix Out of Sync</h3>
              <p className="text-zinc-400 text-sm font-medium max-w-xs mx-auto">We couldn't locate any active digital passes associated with this phone number in our telemetry cluster.</p>
            </motion.div>
          )}

          <AnimatePresence>
            {bookings.length > 0 && (
              <div className="grid gap-12">
                {bookings.map((booking, idx) => (
                  <motion.div
                    key={booking.id || booking._id || `booking-${idx}`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="w-full"
                  >
                    {/* Premium Ornate Digital Pass Design */}
                    <div className="relative group perspective-1000">
                      {/* Premium Modern Ticket Card */}
                      <div className="w-full overflow-hidden flex items-center justify-center py-4 px-2">
                        <div 
                          id="printable-ticket" 
                          className="bg-white rounded-[24px] md:rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-zinc-100 flex flex-row transition-all hover:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.15)] origin-center scale-[0.6] sm:scale-[0.75] md:scale-100 min-w-[700px] md:min-w-0"
                          style={{ margin: '-10% 0' }}
                        >
                        
                        {/* MAIN TICKET BODY */}
                        <div className="flex-1 p-8 md:p-12 flex flex-col relative">
                          {/* Top Header */}
                          <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Ticket className="text-primary" size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Pass Status</p>
                                <p className="text-xs font-bold text-emerald-500 uppercase tracking-tight flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified Active
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                               <Image src="/logo2.png" alt="JeffBen" width={80} height={30} className="object-contain ml-auto opacity-80" />
                               <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest mt-1">Matrix v4.2.1</p>
                            </div>
                          </div>

                          {/* Route Visualizer */}
                          <div className="relative mb-10">
                             <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Departure</p>
                                  <p className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight uppercase">{booking.boardingPoint || "ORIGIN"}</p>
                                </div>
                                <div className="flex-1 px-6 flex flex-col items-center justify-center gap-2">
                                   <div className="w-full h-px bg-zinc-100 relative">
                                      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-primary border-2 border-white" />
                                      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-900 border-2 border-white" />
                                   </div>
                                   <Zap size={14} className="text-primary/40 animate-pulse" />
                                </div>
                                <div className="text-right space-y-1">
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Arrival</p>
                                  <p className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight uppercase">{booking.destination || "DESTIN"}</p>
                                </div>
                             </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-zinc-50">
                             <div className="space-y-1">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Bus Number</p>
                                <p className="text-sm font-bold text-zinc-900 uppercase">{(booking.busId?.busNumber || "JB-FLEET")}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Seat Node</p>
                                <p className="text-sm font-bold text-zinc-900 uppercase">{booking.seats?.[0] || "S-1"}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Travel Date</p>
                                <p className="text-sm font-bold text-zinc-900">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                             </div>
                             <div className="space-y-1 text-right md:text-left">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Sync Time</p>
                                <p className="text-sm font-bold text-zinc-900 uppercase">{booking.busId?.departureTime || "LIVE"}</p>
                             </div>
                          </div>

                          {/* Footer Disclaimer */}
                          <div className="mt-8 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <ShieldCheck size={14} className="text-zinc-300" />
                                <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">Encrypted Ticket Token • Non-Transferable</span>
                             </div>
                             <p className="text-[10px] font-bold text-zinc-900 uppercase tracking-tight">Amt: ₹{booking.totalAmount || "0"}</p>
                          </div>
                        </div>

                        {/* TICKET STUB / QR SECTION */}
                        <div className="bg-zinc-50/50 p-8 md:p-12 md:w-[320px] flex flex-col justify-between items-center border-t md:border-t-0 md:border-l border-dashed border-zinc-200 relative">
                           {/* Side Notches for Ticket Effect */}
                           <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-zinc-100" />
                           <div className="block md:hidden absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-zinc-100" />
                           
                           <div className="flex flex-col items-center gap-6 w-full">
                              <div className="bg-white p-4 rounded-3xl shadow-xl border border-zinc-100 group-hover:scale-105 transition-transform duration-500">
                                <QRCodeSVG
                                  value={booking.qrToken || "INVALID"}
                                  size={160}
                                  fgColor="#18181b"
                                  bgColor="transparent"
                                  level="H"
                                  imageSettings={{
                                    src: "/hero-logo.png",
                                    x: undefined,
                                    y: undefined,
                                    height: 50,
                                    width: 50,
                                    excavate: true,
                                  }}
                                />
                              </div>
                              <div className="text-center space-y-1">
                                 <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Authentication ID</p>
                                 <p className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">{booking.ticketId}</p>
                              </div>
                           </div>

                           <div className="w-full mt-10 space-y-3 no-print">
                              <button 
                                 onClick={() => window.print()}
                                 className="w-full flex items-center justify-center gap-2 h-14 bg-zinc-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-xl shadow-zinc-900/10"
                              >
                                 <Download size={18} />
                                 Print Pass
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Diagnostic Plate */}
          <div className="mt-20 border-t border-zinc-100 pt-12 text-center pb-20">
              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-4">Internal Fleet Diagnostics</p>
              <div className="inline-flex items-center gap-3 bg-zinc-50 px-6 py-3 rounded-2xl border border-zinc-100">
                  <div className={`w-2 h-2 rounded-full ${diagnostics ? "bg-emerald-500" : "bg-zinc-200"}`} />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{diagnostics || "Waiting for signal..."}</span>
              </div>
              <p className="mt-4 text-[9px] text-zinc-400 max-w-xs mx-auto leading-relaxed font-medium">Verification nodes prioritize MongoDB cluster with automated fallback to Supabase cloud matrix via phone-matched primary indexing.</p>
          </div>
        </div>
      </div>
    </div>

      <style jsx global>{`
        @media print {
          @page {
            size: landscape !important;
            margin: 0 !important;
          }

          .no-print, nav, form, .diagnostics-plate, button, .Internal-Fleet-Diagnostics, footer { display: none !important; }
          
          body { 
            background: white !important; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            margin: 0 !important;
            padding: 0 !important;
          }

          main { background: white !important; padding: 0 !important; margin: 0 !important; }
          
          /* Force the ticket to be visible and correctly styled */
          #printable-ticket {
            visibility: visible !important;
            display: flex !important;
            flex-direction: row !important;
            width: 100% !important;
            height: auto !important;
            border: 1px solid #f4f4f5 !important;
            border-radius: 48px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #printable-ticket * {
            visibility: visible !important;
          }

          /* Ensure all nested elements are visible */
          .ticket-container, .ticket-main, .ticket-stub {
            display: flex !important;
          }

          /* Reset margins for printing */
          .mt-20, .pt-12, .pb-20 { margin: 0 !important; padding: 0 !important; }
        }
      `}</style>
    </main>
  );
}
