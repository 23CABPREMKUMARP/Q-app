"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, Phone, Search, Loader2, Ticket, MapPin, 
  Clock, Calendar, QrCode, ShieldCheck, Download, Zap, 
  ChevronRight, ArrowDownLeft, ArrowUpRight, Wallet, History,
  Info, Filter, Share2, Printer
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { WatermarkOverlay } from "@/src/components/ui/WatermarkOverlay";
import { PremiumBoardingPass } from "@/src/components/PremiumBoardingPass";
import { MobileBottomNav } from "@/src/components/MobileBottomNav";
import SecureView from "@/src/components/SecureView";

export default function HistoryPage() {
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<"all" | "bookings" | "spends">("all");
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 150);
  };

  // Pre-load phone number from localStorage if present
  useEffect(() => {
    const savedPhone = localStorage.getItem("registeredPhone");
    if (savedPhone) {
      setPhone(savedPhone);
      fetchBookings(savedPhone);
    }
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
        const paidBookings = data.filter((b: any) => !b.paymentStatus || b.paymentStatus === "Paid");
        setBookings(paidBookings);
        localStorage.setItem("registeredPhone", phoneNum);
      }
    } catch (error) {
      console.error("History query error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    fetchBookings(phone);
  };

  // Compile full history list (combining DB bookings and mock topups/limits)
  const getCombinedHistory = () => {
    const items: any[] = [];
    
    // Add real database bookings
    bookings.forEach((booking) => {
      items.push({
        id: booking._id || booking.ticketId,
        type: "booking",
        title: `Bus Ticket: ${booking.boardingPoint?.split(" ")[0]} → ${booking.destination?.split(" ")[0]}`,
        subtitle: `Seats: ${booking.seats?.join(", ") || "S-1"} • ID: #${booking.ticketId?.slice(-6).toUpperCase()}`,
        date: new Date(booking.bookingDate),
        amount: booking.totalAmount,
        status: "successful",
        rawBooking: booking
      });
    });

    // Add static allocation of spend limit
    items.push({
      id: "limit-allocation-init",
      type: "limit",
      title: "Digi Bus Stand Ticket Purchases",
      subtitle: "Amount used to purchase ticket",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      amount: 2000,
      status: "allocated",
      rawBooking: null
    });

    // Sort by date descending
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const combinedHistory = getCombinedHistory();
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Filter items
  const filteredHistory = combinedHistory.filter(item => {
    if (filterType === "bookings") return item.type === "booking";
    if (filterType === "spends") return item.type === "limit";
    return true;
  });

  return (
    <SecureView>
      <main className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-28 pt-20 overflow-x-hidden safe-bottom">
      
      {/* Saffron Gradient PhonePe Header */}
      <div className="bg-[#E8622C] text-[#111827] fixed top-0 left-0 right-0 z-40 shadow-md rounded-b-3xl">
        <div className="py-6 px-6 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-[#F8FAFC]/10 rounded-xl transition-all">
            <ChevronRight className="rotate-180 text-[#111827]" size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#111827] uppercase">Transaction History</h1>
            <p className="text-[10px] font-bold text-[#111827]/80 uppercase tracking-wider">Metropolitan Transit Passbook & Ledgers</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl md:max-w-4xl mx-auto px-5 pt-8 space-y-6">
        
        {/* Intro Info Banner */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-[#111827] rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] border border-[#E5E7EB] text-[#6B7280] text-[9px] font-black uppercase tracking-wider">
              <ShieldCheck size={12} className="text-[#E8622C]" /> Live DB Sync Nodes Active
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Sync Wallet Ledgers</h2>
            <p className="text-[#6B7280] text-xs font-semibold leading-relaxed max-w-sm">
              Verify your registered transit number to fetch actual trip bookings, spend distributions, and active travel passes.
            </p>
          </div>
          
          {/* Quick Metrics display */}
          {searched && (
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto relative z-10">
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-[#E5E7EB] rounded-2xl p-4 min-w-[120px]">
                <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">Total Spends</span>
                <p className="text-lg font-black text-[#E8622C]">₹{totalSpent}</p>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] border border-[#E5E7EB] rounded-2xl p-4 min-w-[120px]">
                <span className="text-[8px] font-bold text-[#6B7280] uppercase tracking-widest block mb-1">Active Passes</span>
                <p className="text-lg font-black text-[#111827]">{bookings.length}</p>
              </div>
            </div>
          )}
          
          <History className="absolute right-[-20px] bottom-[-20px] text-[#111827]/5" size={140} />
        </div>

        {/* Input Search Form */}
        <motion.form 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSearch}
          className="w-full relative"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[#6B7280]">
              <Phone size={18} />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-Digit Mobile Number"
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl py-4.5 pl-13 pr-28 focus:outline-none focus:ring-4 focus:ring-[#E8622C]/10 focus:border-[#E8622C] transition-all text-sm font-bold tracking-wide placeholder:text-slate-300 text-slate-900 shadow-sm"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] hover:bg-[#E8622C] text-[#111827] px-5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
            >
              {loading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <>
                  <Search size={14} />
                  <span>Fetch</span>
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Main transaction listing panel */}
        {searched && (
          <div className="space-y-4">
            
            {/* Filtering tab controls */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
              <span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest flex items-center gap-1.5">
                <Filter size={10} /> Filters
              </span>
              <div className="flex items-center gap-2">
                {[
                  { id: "all", label: "All Items" },
                  { id: "bookings", label: "Bookings" },
                  { id: "spends", label: "Spends" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
                      filterType === tab.id 
                        ? "bg-[#E8622C] text-[#111827] border-[#E8622C] shadow-sm" 
                        : "bg-[#F8FAFC] text-slate-500 border-[#E5E7EB] hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List entries */}
            <div className="space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 bg-[#F8FAFC] rounded-3xl border border-slate-100 shadow-sm max-w-sm mx-auto space-y-4">
                  <div className="w-12 h-12 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mx-auto border border-slate-100 text-[#6B7280]">
                    <History size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">No Transactions</h3>
                    <p className="text-[#6B7280] text-[10px] font-semibold max-w-[200px] mx-auto leading-relaxed">No ledger activity fits the selected query criteria.</p>
                  </div>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      if (item.type === "booking") {
                        setSelectedBooking(item.rawBooking);
                      }
                    }}
                    className={`bg-[#F8FAFC] rounded-2xl p-4 border border-slate-100 hover:border-[#E8622C] shadow-sm flex items-center justify-between gap-4 transition-all duration-300 ${item.type === "booking" ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Left circular icon status */}
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                        item.type === "booking" 
                          ? "bg-slate-100 text-[#6B7280]" 
                          : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {item.type === "booking" ? (
                          <ArrowDownLeft size={18} className="text-amber-600" />
                        ) : (
                          <ArrowUpRight size={18} />
                        )}
                      </div>
                      <div className="text-left space-y-0.5 max-w-[180px] md:max-w-md">
                        <h4 className="text-[12px] font-black text-slate-900 tracking-tight leading-tight uppercase truncate">{item.title}</h4>
                        <p className="text-[9px] font-semibold text-[#6B7280] leading-none">{item.subtitle}</p>
                        <span className="text-[8px] font-bold text-[#6B7280] block uppercase tracking-wider pt-0.5">
                          {new Date(item.date).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <p className={`text-[13px] font-black leading-none ${
                        item.type === "booking" ? "text-slate-900" : "text-emerald-600"
                      }`}>
                        {item.type === "booking" ? "-" : "+"}₹{item.amount}
                      </p>
                      <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md leading-none ${
                        item.status === "successful" 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* expandable landscape ticket pass modal overlay */}
        <AnimatePresence>
          {selectedBooking && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-slate-950/80 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setSelectedBooking(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                
                <PremiumBoardingPass booking={selectedBooking} currentTime={currentTime} isPrinting={isPrinting} />

                {/* Print Button Wrapper */}
                <div className="w-full flex gap-3 mt-4 print:hidden">
                  <button 
                    onClick={handlePrint}
                    className="flex-[2] py-4 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] hover:bg-[#E8622C] text-[#111827] rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Printer size={14} /> Print Pass
                  </button>
                  <Link href={`/live-map?busId=${selectedBooking.tripId}`} className="flex-[3]">
                    <button 
                      className="w-full h-full py-4 bg-[#0F6B5C] hover:bg-[#059669] text-[#111827] rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <MapPin size={14} /> Track Bus
                    </button>
                  </Link>
                </div>
                
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="absolute top-4 right-4 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#111827] p-2.5 rounded-full hover:bg-[#E8622C] transition-all shadow-md"
                >
                  <ChevronRight className="rotate-90" size={16} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Global Bottom PhonePe Navigation */}
      <MobileBottomNav />
    </main>
    </SecureView>
  );
}
