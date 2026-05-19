"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, ArrowUpDown, Calendar, User, ChevronRight, Filter, 
  MapPin, Clock, ShieldCheck, Zap, Info, CreditCard, Sparkles,
  Award, RefreshCw, X, Check, CheckCircle2, Download, AlertTriangle, Phone
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { QRCodeSVG } from "qrcode.react";
import { MOCK_BUSES } from "@/src/lib/constants";
import { RollingNumber } from "@/src/components/ui/RollingNumber";
import { IntelligentPhoneInput } from "@/src/components/ui/IntelligentPhoneInput";

const Confetti = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-[2000] overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            top: "50%", 
            left: "50%", 
            scale: 0,
            x: 0,
            y: 0,
            rotate: 0
          }}
          animate={{ 
            x: (Math.random() - 0.5) * 600,
            y: (Math.random() - 0.5) * 600 - 100,
            scale: [0, 1, 0.5],
            rotate: Math.random() * 360,
            opacity: [1, 1, 0]
          }}
          transition={{ 
            duration: 2, 
            ease: "easeOut",
            delay: Math.random() * 0.2
          }}
          className="absolute w-2 h-2 rounded-sm"
          style={{ 
            backgroundColor: ['#FF9933', '#3B82F6', '#10B981', '#EF4444'][Math.floor(Math.random() * 4)] 
          }}
        />
      ))}
    </div>
  );
};

// Unique stops list gathered from MOCK_BUSES routes
const POPULAR_STOPS = [
  "Gandhipuram Central",
  "Mettupalayam Terminal",
  "Ukkadam Hub",
  "Pollachi Terminal",
  "Coimbatore Junction",
  "Avinashi Terminal",
  "Saravanampatti Signal",
  "Annur Bus Stand",
  "Walayar (Last Stop)"
];

const POPULAR_ROUTES = [
  { from: "Gandhipuram Central", to: "Mettupalayam Terminal" },
  { from: "Ukkadam Hub", to: "Pollachi Terminal" },
  { from: "Coimbatore Junction", to: "Avinashi Terminal" },
  { from: "Saravanampatti Signal", to: "Annur Bus Stand" }
];

export default function SearchBusesPage() {
  // Search parameters
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [passengerCount, setPassengerCount] = useState(1);
  
  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [buses, setBuses] = useState<any[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<any[]>([]);

  // Search input overlays
  const [showSourceOverlay, setShowSourceOverlay] = useState(false);
  const [showDestOverlay, setShowDestOverlay] = useState(false);

  // Sorting and Filtering
  const [sortBy, setSortBy] = useState<"cheapest" | "fastest" | "earliest">("cheapest");
  const [filterAC, setFilterAC] = useState<boolean | null>(null);
  const [filterSleeper, setFilterSleeper] = useState<boolean | null>(null);

  // Booking process state
  const [bookingBus, setBookingBus] = useState<any | null>(null);
  const [passengerPhone, setPassengerPhone] = useState("");
  const [passengerName, setPassengerName] = useState("Passenger");
  const [bookingStep, setBookingStep] = useState<"search" | "seats" | "payment" | "success">("search");
  const [finalTicket, setFinalTicket] = useState<any | null>(null);
  const [paymentState, setPaymentState] = useState<'idle' | 'preparing' | 'verifying' | 'success' | 'failed'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Initialize date strip to next 7 days
  const [dates, setDates] = useState<{ day: string; dateNum: string; full: string }[]>([]);
  useEffect(() => {
    const datesArr = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      datesArr.push({
        day: days[d.getDay()],
        dateNum: d.getDate().toString(),
        full: d.toISOString().split("T")[0]
      });
    }
    setDates(datesArr);
    setSelectedDate(datesArr[0].full);

    // Load recent registered phone
    const savedPhone = localStorage.getItem("registeredPhone");
    if (savedPhone) setPassengerPhone(savedPhone);
  }, []);

  // Fetch or simulate buses
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!source || !destination) return;

    setIsSearching(true);
    try {
      const res = await fetch("/api/buses");
      let data = [];
      if (res.ok) {
        data = await res.json();
      }
      
      const activeBuses = data.length > 0 ? data : MOCK_BUSES;
      
      // Filter buses to match the search query (strictly match stop order direction)
      const matches = activeBuses.filter((bus: any) => {
        const routeFrom = (bus.routeId?.from || "").toLowerCase();
        const routeTo = (bus.routeId?.to || "").toLowerCase();
        const queryFrom = source.trim().toLowerCase();
        const queryTo = destination.trim().toLowerCase();

        // Must be actively scheduled or running (not completed or inactive)
        const isActive = bus.status !== "Completed" && bus.status !== "Inactive";
        if (!isActive) return false;

        // Identify stop sequence positions
        let sourceIdx = -1;
        let destIdx = -1;

        if (routeFrom.includes(queryFrom)) {
          sourceIdx = 0;
        }
        if (routeTo.includes(queryTo)) {
          destIdx = (bus.routeId?.stops?.length || 0) + 1;
        }

        if (bus.routeId?.stops) {
          bus.routeId.stops.forEach((s: any, idx: number) => {
            const stopName = (s.stopName || "").toLowerCase();
            if (stopName.includes(queryFrom)) {
              sourceIdx = idx + 1;
            }
            if (stopName.includes(queryTo)) {
              destIdx = idx + 1;
            }
          });
        }

        // Must match both stops and the travel direction must be valid
        return sourceIdx !== -1 && destIdx !== -1 && sourceIdx < destIdx;
      });

      // Enhance simulated metadata for listings with no fallback slice
      const enhancedMatches = matches.map((b: any, index: number) => {
        const types = ["AC Sleeper (2+1)", "Express Seater (2+2)", "Scania Multi-Axle Premium"];
        const operatorNames = ["JeffBen Premium Express", "JB Metropolitan Sleeper", "JeffBen Fleet Liner"];
        const ratings = ["4.8", "4.6", "4.9"];
        return {
          ...b,
          operatorName: operatorNames[index % operatorNames.length],
          busType: types[index % types.length],
          rating: ratings[index % ratings.length],
          duration: index % 2 === 0 ? "1h 30m" : "2h 00m",
          features: ["Live GPS", "Secure Charger", "Complimentary Water", "CCTV Security"]
        };
      });

      setBuses(enhancedMatches);
      setHasSearched(true);
    } catch (err) {
      console.error("Failed to query buses:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Sorting and Filtering effect
  useEffect(() => {
    let result = [...buses];

    // Filter AC
    if (filterAC !== null) {
      result = result.filter(b => filterAC ? b.busType.includes("AC") : !b.busType.includes("AC"));
    }

    // Filter Sleeper
    if (filterSleeper !== null) {
      result = result.filter(b => filterSleeper ? b.busType.includes("Sleeper") : !b.busType.includes("Sleeper"));
    }

    // Sort
    if (sortBy === "cheapest") {
      result.sort((a, b) => (a.fare || 150) - (b.fare || 150));
    } else if (sortBy === "fastest") {
      result.sort((a, b) => a.duration.localeCompare(b.duration));
    } else if (sortBy === "earliest") {
      result.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    setFilteredBuses(result);
  }, [buses, sortBy, filterAC, filterSleeper]);

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSelectPopularRoute = (route: { from: string; to: string }) => {
    setSource(route.from);
    setDestination(route.to);
  };

  const startSeatSelection = (bus: any) => {
    setBookingBus(bus);
    setPassengerCount(1);
    setBookingStep("seats");
  };

  const handlePayment = async () => {
    if (!bookingBus) return;
    setPaymentState('preparing');
    setPaymentError(null);
    
    try {
      const amount = passengerCount * (bookingBus.fare || 150);
      
      // 1. Create Razorpay Order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      
      const orderData = await orderRes.json();
      
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: "INR",
        name: "JeffBen Systems",
        description: `Bus Booking: ${bookingBus.busNumber}`,
        order_id: orderData.id,
        handler: async (response: any) => {
          setPaymentState('verifying');
          
          try {
            // 3. Verify Payment and Finalize Booking
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingDetails: {
                  busId: bookingBus._id || "mock-bus-id",
                  seats: Array.from({ length: passengerCount }, (_, i) => `S-${i + 1}`),
                  totalAmount: amount,
                  boardingPoint: source,
                  destination: destination,
                  passengers: [{ name: passengerName, phone: passengerPhone }]
                }
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setFinalTicket(verifyData.booking);
              setPaymentState('success');
              setBookingStep("success");
              
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([100, 30, 100]);
              }
            } else {
              throw new Error(verifyData.message || 'Payment verification failed');
            }
          } catch (err: any) {
            setPaymentState('failed');
            setPaymentError(err.message || "Failed to verify payment");
            console.error("Verification Error:", err);
          }
        },
        modal: {
          ondismiss: function() {
            setPaymentState('failed');
            setPaymentError("Payment cancelled by user");
          }
        },
        prefill: {
          contact: passengerPhone || "9999999999",
          name: passengerName || "JeffBen User",
        },
        theme: {
          color: "#FF9933",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      setPaymentState('failed');
      setPaymentError(error.message || "Failed to initialize payment");
      console.error("Payment Initialization Error:", error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28 pt-6 overflow-x-hidden safe-bottom">
      
      {/* Top Header */}
      <div className="max-w-md mx-auto px-5 mb-6 flex items-center justify-between">
        <Link href="/" className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:bg-slate-50">
          <X className="text-slate-600" size={18} />
        </Link>
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-center">Discovery Portal</span>
          <h1 className="text-base font-black text-slate-900 uppercase tracking-tight text-center">Discovery Express</h1>
        </div>
        <div className="w-9" />
      </div>

      <div className="max-w-md mx-auto px-5">
        <AnimatePresence mode="wait">
          
          {/* SEARCH INTERFACE STEP */}
          {bookingStep === "search" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Search Card Deck */}
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-[0_15px_30px_rgba(0,0,0,0.02)] relative space-y-4">
                
                {/* Swap locations badge */}
                <div className="absolute right-8 top-18 z-20">
                  <button 
                    onClick={handleSwap}
                    className="w-10 h-10 bg-slate-950 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all border-2 border-white"
                  >
                    <ArrowUpDown size={16} className="text-orange-500" />
                  </button>
                </div>

                {/* Source Input */}
                <div className="space-y-1 relative">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Departure From</label>
                  <button 
                    onClick={() => setShowSourceOverlay(true)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl py-4.5 px-5 flex items-center gap-3 text-left font-bold text-sm text-slate-800 focus:outline-none"
                  >
                    <MapPin className="text-orange-500 shrink-0" size={16} />
                    <span className="truncate">{source || "Select Source Station"}</span>
                  </button>
                </div>

                {/* Destination Input */}
                <div className="space-y-1 relative">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Going To</label>
                  <button 
                    onClick={() => setShowDestOverlay(true)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl py-4.5 px-5 flex items-center gap-3 text-left font-bold text-sm text-slate-800 focus:outline-none"
                  >
                    <MapPin className="text-slate-950 shrink-0" size={16} />
                    <span className="truncate">{destination || "Select Destination Station"}</span>
                  </button>
                </div>

                {/* Travel Date Horizontal Selector */}
                <div className="space-y-2 pt-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Travel Date</label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {dates.map((d, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(d.full)}
                        className={`flex-col p-3 rounded-2xl border transition-all flex items-center min-w-[62px] ${selectedDate === d.full ? "bg-slate-950 text-white border-slate-950" : "bg-slate-50 text-slate-600 border-slate-100"}`}
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider">{d.day}</span>
                        <span className="text-base font-black tracking-tight mt-0.5">{d.dateNum}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Passengers quantity selection */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Passengers</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1">
                      <button 
                        type="button"
                        onClick={() => setPassengerCount(prev => Math.max(1, prev - 1))}
                        className="w-6 h-6 bg-white rounded-lg flex items-center justify-center font-bold text-slate-800 shadow-sm border border-slate-200"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-slate-950">{passengerCount}</span>
                      <button 
                        type="button"
                        onClick={() => setPassengerCount(prev => Math.min(6, prev + 1))}
                        className="w-6 h-6 bg-slate-950 text-white rounded-lg flex items-center justify-center font-bold shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  onClick={() => handleSearch()}
                  disabled={!source || !destination || isSearching}
                  className="w-full h-15 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 active:scale-95 disabled:opacity-30 transition-all mt-4"
                >
                  {isSearching ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                  <span>Search Buses</span>
                </button>
              </div>

              {/* Autocomplete Stop Overlay - Source */}
              <AnimatePresence>
                {showSourceOverlay && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
                  >
                    <motion.div 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      className="bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar relative"
                    >
                      <button onClick={() => setShowSourceOverlay(false)} className="absolute top-6 right-6 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500">
                        <X size={16} />
                      </button>
                      <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">Select Departure Station</h3>
                      <div className="space-y-2 pt-2">
                        {POPULAR_STOPS.map((stop, index) => (
                          <button
                            key={index}
                            onClick={() => { setSource(stop); setShowSourceOverlay(false); }}
                            className="w-full text-left p-4.5 bg-slate-50 hover:bg-[#FF9933]/10 border border-slate-100 rounded-xl font-bold text-xs flex items-center gap-3 transition-all"
                          >
                            <MapPin size={14} className="text-orange-500" />
                            <span>{stop}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Autocomplete Stop Overlay - Destination */}
              <AnimatePresence>
                {showDestOverlay && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
                  >
                    <motion.div 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      className="bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar relative"
                    >
                      <button onClick={() => setShowDestOverlay(false)} className="absolute top-6 right-6 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500">
                        <X size={16} />
                      </button>
                      <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">Select Arrival Destination</h3>
                      <div className="space-y-2 pt-2">
                        {POPULAR_STOPS.filter(s => s !== source).map((stop, index) => (
                          <button
                            key={index}
                            onClick={() => { setDestination(stop); setShowDestOverlay(false); }}
                            className="w-full text-left p-4.5 bg-slate-50 hover:bg-[#FF9933]/10 border border-slate-100 rounded-xl font-bold text-xs flex items-center gap-3 transition-all"
                          >
                            <MapPin size={14} className="text-slate-900" />
                            <span>{stop}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Popular Routes Suggested */}
              {!hasSearched && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Suggested Popular Routes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {POPULAR_ROUTES.map((route, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectPopularRoute(route)}
                        className="bg-white border border-slate-100 p-4.5 rounded-2xl text-left shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:border-orange-500/50 transition-all flex flex-col justify-between h-24 relative overflow-hidden group"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest block leading-none">Route</span>
                          <span className="text-xs font-black text-slate-900 leading-tight block truncate pr-4">{route.from.split(" ")[0]} → {route.to.split(" ")[0]}</span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 mt-2 block">Direct Superfast</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* BUS LISTING GRID RESULTS */}
              {hasSearched && (
                <div className="space-y-6">
                  
                  {/* Filter & Sorting Controls Strip */}
                  <div className="space-y-3">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      <button 
                        onClick={() => setSortBy("cheapest")}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-full border transition-all ${sortBy === "cheapest" ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-600 border-slate-200"}`}
                      >
                        Cheapest First
                      </button>
                      <button 
                        onClick={() => setSortBy("fastest")}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-full border transition-all ${sortBy === "fastest" ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-600 border-slate-200"}`}
                      >
                        Fastest Duration
                      </button>
                      <button 
                        onClick={() => setSortBy("earliest")}
                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-full border transition-all ${sortBy === "earliest" ? "bg-slate-950 text-white border-slate-950" : "bg-white text-slate-600 border-slate-200"}`}
                      >
                        Earliest
                      </button>
                    </div>

                    {/* AC and Sleeper tags */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setFilterAC(prev => prev === null ? true : prev === true ? false : null)}
                        className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1 ${filterAC === true ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : filterAC === false ? "bg-slate-950 text-white border-slate-950" : "bg-slate-100 text-slate-500 border-slate-200/50"}`}
                      >
                        AC: {filterAC === true ? "ONLY" : filterAC === false ? "NON-AC" : "ALL"}
                      </button>
                      <button 
                        onClick={() => setFilterSleeper(prev => prev === null ? true : prev === true ? false : null)}
                        className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1 ${filterSleeper === true ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : filterSleeper === false ? "bg-slate-950 text-white border-slate-950" : "bg-slate-100 text-slate-500 border-slate-200/50"}`}
                      >
                        Sleeper: {filterSleeper === true ? "YES" : filterSleeper === false ? "SEATER" : "ALL"}
                      </button>
                    </div>
                  </div>

                  {/* Listings cards */}
                  {filteredBuses.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 text-center space-y-6 shadow-[0_10px_20px_rgba(0,0,0,0.01)] max-w-md mx-auto relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
                      <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
                        <AlertTriangle size={28} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">No Bus Found</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-[#FF9933]">Assigned Fleet Units Offline</p>
                        <p className="text-xs text-slate-500 leading-relaxed pt-1">
                          We couldn't find any active scheduled buses mapped with live telemetry broadcasting from <span className="font-bold text-slate-900 uppercase">{source}</span> to <span className="font-bold text-slate-900 uppercase">{destination}</span>.
                        </p>
                      </div>
                      
                      <div className="bg-slate-50/50 border border-slate-100/50 rounded-2xl p-4 text-left space-y-3">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Try Popular Active Routes</h5>
                        <div className="grid grid-cols-1 gap-2">
                          {POPULAR_ROUTES.map((route, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSource(route.from);
                                setDestination(route.to);
                                setTimeout(() => {
                                  handleSearch();
                                }, 100);
                              }}
                              className="w-full text-xs font-bold text-slate-700 hover:text-orange-500 bg-white hover:bg-orange-50/50 border border-slate-100 rounded-xl p-2.5 transition-all text-left flex items-center justify-between shadow-sm active:scale-[0.98]"
                            >
                              <span>{route.from} ➔ {route.to}</span>
                              <ChevronRight size={14} className="text-slate-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredBuses.map((bus, idx) => (
                        <motion.div
                          key={bus._id || idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white border border-slate-100 rounded-[32px] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.02)] space-y-4 hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] transition-all"
                        >
                          {/* Card Top Block */}
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Bus {bus.busCode || "1024"} • {bus.busNumber || bus.operatorName}</span>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-slate-900 leading-none truncate max-w-[200px]">{bus.routeId?.routeName || bus.busType}</h4>
                                <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0">
                                  ★ {bus.rating}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-orange-500 block">₹{bus.fare || 150}</span>
                              <span className="text-[8px] font-semibold text-slate-400 block mt-0.5">Per seat base</span>
                            </div>
                          </div>

                          {/* Time details and live indicators */}
                          <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-slate-100 text-xs">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900">{bus.departureTime || "08:00 AM"}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Start</p>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center px-4">
                              <span className="text-[8px] font-bold text-slate-400 block mb-0.5">{bus.duration}</span>
                              <div className="w-full h-0.5 bg-slate-100 relative">
                                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-1 rounded-full bg-slate-400" />
                                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-1 rounded-full bg-orange-500" />
                              </div>
                              <span className="text-[7px] font-black text-orange-500 uppercase tracking-widest mt-0.5">Live Tracking</span>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="font-bold text-slate-900">{bus.arrivalTime || "09:30 AM"}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Arrive</p>
                            </div>
                          </div>

                          {/* Live Seats availability */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                              <Zap size={12} className="text-orange-500" />
                              <span>{bus.availableSeats} Seats Available</span>
                            </div>
                            <button
                              onClick={() => startSeatSelection(bus)}
                              className="px-5 py-2.5 bg-slate-950 hover:bg-[#FF9933] text-white rounded-xl font-bold text-[9px] uppercase tracking-widest active:scale-95 transition-all shadow-sm"
                            >
                              Select Seats
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* SEAT COUNT SELECTION COMPONENT STEP */}
          {bookingStep === "seats" && bookingBus && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Back to search */}
              <button 
                onClick={() => setBookingStep("search")}
                className="inline-flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest"
              >
                ← Back to listings
              </button>

              <div className="text-center space-y-1">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Select Passengers</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{bookingBus.busType} | {bookingBus.availableSeats} Seats Available</p>
              </div>

              {/* Quantity Counter Card */}
              <div className="flex flex-col items-center py-6 bg-white rounded-[32px] border border-slate-100 shadow-sm max-w-sm mx-auto">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Ticket Quantity</p>
                <div className="flex items-center gap-10">
                  <button 
                    onClick={() => setPassengerCount(prev => Math.max(1, prev - 1))} 
                    className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-black text-slate-900 shadow-sm hover:bg-slate-950 hover:text-white transition-all border border-slate-200"
                  >
                    -
                  </button>
                  <div className="text-5xl font-black text-slate-900 min-w-[80px] flex justify-center">
                    <RollingNumber value={passengerCount} />
                  </div>
                  <button 
                    onClick={() => setPassengerCount(prev => Math.min(bookingBus.availableSeats || 40, prev + 1))} 
                    className="w-12 h-12 bg-[#FF9933] rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg hover:bg-slate-950 transition-all"
                  >
                    +
                  </button>
                </div>

                <div className="w-full px-6 mt-6 space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Contact Mobile Number</label>
                    <IntelligentPhoneInput 
                      value={passengerPhone}
                      onChange={(val) => setPassengerPhone(val)}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom checkout summary sheet */}
              <div className="bg-slate-900 rounded-[32px] p-6 text-white space-y-4 shadow-xl max-w-sm mx-auto">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Seats Count</span>
                    <span className="text-base font-black text-white">{passengerCount} Seats</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Subtotal fare</span>
                    <span className="text-lg font-black text-[#FF9933]">₹{passengerCount * (bookingBus.fare || 150)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setBookingStep("payment")}
                  disabled={passengerPhone.length < 10}
                  className="w-full h-14 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-30 transition-all"
                >
                  Proceed to Payment <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* PAYMENT DETAILS/SUMMARY STEP */}
          {bookingStep === "payment" && bookingBus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="space-y-6 max-w-sm mx-auto"
            >
              {/* Back to seats */}
              <button 
                onClick={() => setBookingStep("seats")}
                className="inline-flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest"
              >
                ← Back to Passenger Selection
              </button>

              <div className="bg-slate-950 rounded-[40px] p-8 text-white space-y-6 relative overflow-hidden group text-left">
                {/* Animated Gradient Glow */}
                <motion.div 
                  animate={{ 
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-20 -right-20 w-64 h-64 bg-[#FF9933] rounded-full blur-[100px] pointer-events-none"
                />
                
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CreditCard size={120} />
                </div>
                
                <div className="space-y-1 relative z-10">
                  <p className="text-[10px] font-black text-[#FF9933] uppercase tracking-[0.4em]">Payment Summary</p>
                  <h4 className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap truncate font-heading">{bookingBus.busNumber || "DIGI BUS"}</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Tickets</p>
                    <div className="flex items-center gap-1">
                      <RollingNumber value={passengerCount} />
                      <span className="text-sm font-black ml-1">Seats</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Total Fare</p>
                    <div className="text-xl font-black text-[#FF9933] flex justify-end">
                      <RollingNumber value={passengerCount * (bookingBus.fare || 150)} prefix="₹" />
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-zinc-800" />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <MapPin size={14} className="text-zinc-500" />
                    <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-tight">{source} → {destination}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-zinc-500" />
                    <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-tight">{passengerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Checkout buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handlePayment}
                  disabled={paymentState !== 'idle' && paymentState !== 'failed'}
                  className="w-full h-16 bg-[#FF9933] text-white rounded-[24px] font-black text-base tracking-tighter hover:bg-slate-900 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 relative overflow-hidden group"
                >
                  <AnimatePresence mode="wait">
                    {paymentState === 'idle' || paymentState === 'failed' ? (
                      <motion.div 
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3"
                      >
                        Secure Checkout <ChevronRight size={20} />
                      </motion.div>
                    ) : paymentState === 'preparing' ? (
                      <motion.div 
                        key="preparing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw size={18} className="animate-spin" /> Preparing Payment...
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="verifying"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw size={18} className="animate-spin" /> Verifying Node Sync...
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                {paymentError && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-500 text-center flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={16} />
                    <p className="text-[10px] font-black uppercase tracking-tight">{paymentError}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* SUCCESS BOARDING PASS TICKETS COMPONENT */}
          {bookingStep === "success" && finalTicket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 relative"
            >
              <Confetti />
              
              <div className="text-center space-y-4 relative z-10 mb-12">
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100"
                >
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </motion.div>
                <div className="space-y-1">
                  <motion.h4 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-slate-900 tracking-tight uppercase"
                  >
                    Payment Verified
                  </motion.h4>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest"
                  >
                    Ticket Generated Successfully
                  </motion.p>
                </div>
              </div>

              {/* Modern Compact Ticket Card (Horizontal Landscape Layout matching Live Map) */}
              <div className="w-full overflow-hidden flex items-center justify-center py-4">
                <motion.div 
                  id="printable-ticket"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.3 }}
                  className="bg-white rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col md:flex-row transition-all hover:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.15)] origin-center min-w-[320px] md:min-w-[600px] relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#FF9933]" />
                  
                  <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 md:gap-6 bg-slate-50/50 w-full md:w-[240px]">
                    <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-50">
                      <QRCodeSVG 
                        value={finalTicket.qrToken} 
                        size={140} 
                        level="H"
                        fgColor="#0f172a"
                        imageSettings={{
                          src: "/hero-logo.png",
                          height: 36,
                          width: 36,
                          excavate: true,
                        }}
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Pass Identity Token</p>
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{finalTicket.ticketId}</p>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex-1 space-y-6 flex flex-col justify-center text-left">
                    {/* Travel Route Segment */}
                    <div className="relative">
                      <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Departure</p>
                          <p className="text-lg font-bold text-slate-900 tracking-tight uppercase">{finalTicket.boardingPoint.split(" ")[0]}</p>
                        </div>
                        <div className="flex-1 px-4 flex flex-col items-center justify-center gap-1">
                          <div className="w-full h-px bg-slate-100 relative">
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FF9933]" />
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Arrival</p>
                          <p className="text-lg font-bold text-slate-900 tracking-tight uppercase">{finalTicket.destination.split(" ")[0]}</p>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-50">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bus Number</p>
                        <p className="text-xs font-bold text-slate-900 uppercase">{bookingBus.busNumber || "TN-38"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Seats Count</p>
                        <p className="text-xs font-bold text-slate-900 uppercase">{finalTicket.seats?.length || passengerCount} Seats</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Travel Date</p>
                        <p className="text-xs font-bold text-slate-900">{finalTicket.bookingDate ? new Date(finalTicket.bookingDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Time departure</p>
                        <p className="text-xs font-bold text-slate-900 uppercase">{bookingBus.departureTime || "LIVE"}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-[8px] font-bold text-[#FF9933]/70 uppercase tracking-widest">Encrypted Ticket Token • Non-Transferable</span>
                      <div className="bg-[#FF9933]/10 px-3 py-1.5 rounded-xl border border-[#FF9933]/25 text-right shrink-0">
                        <span className="text-[8px] font-bold text-[#FF9933] uppercase tracking-wider block mb-0.5">Total Fare</span>
                        <p className="text-sm font-black text-slate-900 leading-none">₹{finalTicket.totalAmount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Side Notches */}
                  <div className="hidden md:block absolute left-[240px] top-0 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 border border-slate-100" />
                  <div className="hidden md:block absolute left-[240px] bottom-0 translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 border border-slate-100" />
                </motion.div>
              </div>

              {/* Action utilities */}
              <div className="space-y-3 max-w-sm mx-auto">
                <button 
                  onClick={() => window.print()}
                  className="w-full h-14 bg-slate-950 hover:bg-[#FF9933] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <Download size={14} /> Download E-Ticket PDF
                </button>

                <Link
                  href="/"
                  className="w-full h-14 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all text-center"
                >
                  Return to Dashboard
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </main>
  );
}
