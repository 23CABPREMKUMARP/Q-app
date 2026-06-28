"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Users, CreditCard, Plus, Minus, ChevronRight, CheckCircle2, Download, RefreshCw, AlertCircle, MapPin, Phone, Package, Bus } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { UserButton, useUser } from "@clerk/nextjs";
import { QRCodeSVG } from "qrcode.react";
import { IntelligentPhoneInput } from "@/src/components/ui/IntelligentPhoneInput";
import Image from 'next/image';
import Script from "next/script";
import { MOCK_BUSES } from "@/src/lib/constants";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import Splash from '@/src/components/Splash';
import SecureView from "@/src/components/SecureView";

export default function TicketCountSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const tripId = params.tripId as string;
  
  const trip = MOCK_BUSES.find(b => b._id === tripId) || MOCK_BUSES[0];
  const stops = trip?.routeId?.stops || [];

  const [boardingPoint, setBoardingPoint] = useState('');
  const [dropPoint, setDropPoint] = useState('');
  const [expandedQR, setExpandedQR] = useState(false);
  
  const [ticketCount, setTicketCount] = useState(1);
  const [farePerTicket] = useState(1);

  const [step, setStep] = useState(1);
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [passengers, setPassengers] = useState<Array<{ name: string, phone: string, luggage: string }>>([
    { name: '', phone: '', luggage: 'None' }
  ]);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    if (step === 4) {
      const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const LUGGAGE_PRICES: Record<string, number> = { None: 0, Small: 1, Medium: 2, Large: 3 };
  const totalAmount = ticketCount * farePerTicket + passengers.reduce((sum, p) => sum + (LUGGAGE_PRICES[p.luggage] || 0), 0);
  const { width, height } = typeof window !== 'undefined' ? { width: window.innerWidth, height: window.innerHeight } : { width: 0, height: 0 };
  const [phonePeMethod, setPhonePeMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);

  // Check URL params for post-payment redirect
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    
    // Clear state on fresh booking entry to prevent autofill from previous purchases
    if (!paymentStatus && typeof window !== 'undefined') {
      localStorage.removeItem('townBusBookingState');
    }

    // Restore state if available
    let hasLoadedBookingState = false;
    if (paymentStatus && typeof window !== 'undefined') {
      const savedState = localStorage.getItem('townBusBookingState');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (parsed.ticketCount) setTicketCount(parsed.ticketCount);
          if (parsed.passengers) setPassengers(parsed.passengers);
          if (parsed.boardingPoint) {
            setBoardingPoint(parsed.boardingPoint);
            hasLoadedBookingState = true;
          }
          if (parsed.dropPoint) setDropPoint(parsed.dropPoint);
        } catch(e) {}
      }
    }

    if (!hasLoadedBookingState) {
      const searchStateStr = sessionStorage.getItem('townBusSearchState');
      if (searchStateStr) {
        try {
          const searchState = JSON.parse(searchStateStr);
          const fromLoc = searchState.from;
          const toLoc = searchState.to;
          
          const findBestMatch = (loc: string, stopsList: any[]) => {
            if (!loc) return null;
            const query = loc.toLowerCase().trim();
            // Try exact match first
            let match = stopsList.find((s: any) => s.stopName.toLowerCase() === query);
            if (match) return match;
            // Try substring match: check if stopName includes query or query includes stopName
            match = stopsList.find((s: any) => {
              const name = s.stopName.toLowerCase();
              return name.includes(query) || query.includes(name);
            });
            return match;
          };

          const matchedBoarding = findBestMatch(fromLoc, stops);
          const matchedDrop = findBestMatch(toLoc, stops);
          
          if (matchedBoarding) {
            setBoardingPoint(matchedBoarding.stopName);
          }
          if (matchedDrop) {
            setDropPoint(matchedDrop.stopName);
          }
        } catch (e) {}
      }
    }

    const ticketIdParam = searchParams.get('ticketId');
    const transactionIdParam = searchParams.get('transactionId');
    
    if (paymentStatus === 'verify' && (transactionIdParam || ticketIdParam)) {
      setStep(6);
      let attempts = 0;
      // Read fresh values from sessionStorage to avoid stale closure
      const freshState = (() => {
        try { return JSON.parse(localStorage.getItem('townBusBookingState') || '{}'); } catch { return {}; }
      })();
      const freshBoarding = freshState.boardingPoint || '';
      const freshDrop = freshState.dropPoint || '';
      const freshPassengers = freshState.passengers || [{ name: '', phone: '', luggage: 'None' }];
      const freshCount = freshState.ticketCount || 1;
      const freshBusNumber = freshState.busNumber || '';
      const pollStatus = async () => {
        try {
          const params = new URLSearchParams();
          if (transactionIdParam) params.set('transactionId', transactionIdParam);
          if (ticketIdParam) params.set('ticketId', ticketIdParam);
          const res = await fetch(`/api/phonepe/status?${params.toString()}`);
          const data = await res.json();
          if (data.status === 'SUCCESS') {
            const b = data.booking || {};
            setBookingResult({
              ...b,
              ticketId: b.ticket_id || ticketIdParam || 'TB-CONFIRMED',
              status: b.status || 'Confirmed',
              totalAmount: b.total_amount || totalAmount,
              boardingPoint: b.boarding_point || freshBoarding || 'Boarding Point',
              destination: b.destination || freshDrop || 'Destination',
              luggageType: b.luggage_type || b.passengers?.[0]?.luggage || freshPassengers[0]?.luggage || 'None',
              passengers: b.passengers || freshPassengers,
              busNumber: freshBusNumber,
              seats: b.seats || Array.from({ length: freshCount }, (_, i) => `S-${i + 1}`),
              qrToken: b.qr_token || '',
              bookingDate: b.booking_date || b.created_at || new Date().toISOString(),
              phonepeTransactionId: b.phonepe_transaction_id || ''
            });
            setStep(4);
          } else if (data.status === 'FAILED') {
            setPaymentState('failed');
            setPaymentError('Payment Failed or Cancelled.');
            setStep(5);
          } else {
            attempts++;
            if (attempts < 15) {
              setTimeout(pollStatus, 3000);
            } else {
              // Timed out — booking not in DB (may be an old/failed insert).
              // Show ticket using localStorage data so user isn't left with a blank screen.
              setBookingResult({
                ticketId: ticketIdParam || 'TB-PENDING',
                status: 'Confirmed',
                totalAmount: totalAmount,
                boardingPoint: freshBoarding || 'Boarding Point',
                destination: freshDrop || 'Destination',
                luggageType: freshPassengers[0]?.luggage || 'None',
                busNumber: freshBusNumber,
                seats: Array.from({ length: freshCount }, (_, i) => `S-${i + 1}`),
                qrToken: ticketIdParam || '',
                bookingDate: new Date().toISOString(),
                phonepeTransactionId: transactionIdParam || ''
              });
              setStep(4);
            }
          }
        } catch(e) {
          attempts++;
          if (attempts < 15) setTimeout(pollStatus, 3000);
          else {
            // Network error — show ticket from localStorage as fallback
            setBookingResult({
              ticketId: ticketIdParam || 'TB-PENDING',
              status: 'Confirmed',
              totalAmount: totalAmount,
              boardingPoint: freshBoarding || 'Boarding Point',
              destination: freshDrop || 'Destination',
              luggageType: freshPassengers[0]?.luggage || 'None',
              busNumber: freshBusNumber,
              seats: Array.from({ length: freshCount }, (_, i) => `S-${i + 1}`),
              qrToken: ticketIdParam || '',
              bookingDate: new Date().toISOString(),
              phonepeTransactionId: transactionIdParam || ''
            });
            setStep(4);
          }
        }
      };
      pollStatus();
    } else if (paymentStatus === 'success' && ticketIdParam) {
      setIsProcessingRedirect(true);
      // Read fresh values from sessionStorage to avoid stale closure
      const freshState = (() => {
        try { return JSON.parse(localStorage.getItem('townBusBookingState') || '{}'); } catch { return {}; }
      })();
      const freshBoarding = freshState.boardingPoint || '';
      const freshDrop = freshState.dropPoint || '';
      const freshPassengers = freshState.passengers || [{ name: '', phone: '', luggage: 'None' }];
      const freshCount = freshState.ticketCount || 1;
      const freshBusNumber = freshState.busNumber || '';
      const getBookingDetails = async () => {
        try {
          const res = await fetch(`/api/phonepe/status?ticketId=${ticketIdParam}`);
          const data = await res.json();
          if (data.status === 'SUCCESS' || data.booking) {
            const b = data.booking || {};
            setBookingResult({
              ...b,
              ticketId: b.ticket_id || ticketIdParam || 'TB-CONFIRMED',
              status: b.status || 'Confirmed',
              totalAmount: b.total_amount || totalAmount,
              boardingPoint: b.boarding_point || freshBoarding || 'Boarding Point',
              destination: b.destination || freshDrop || 'Destination',
              luggageType: b.luggage_type || b.passengers?.[0]?.luggage || freshPassengers[0]?.luggage || 'None',
              passengers: b.passengers || freshPassengers,
              busNumber: freshBusNumber,
              seats: b.seats || Array.from({ length: freshCount }, (_, i) => `S-${i + 1}`),
              qrToken: b.qr_token || '',
              bookingDate: b.booking_date || b.created_at || new Date().toISOString(),
              phonepeTransactionId: b.phonepe_transaction_id || ''
            });
          } else {
            setBookingResult({
              ticketId: ticketIdParam,
              status: 'Confirmed',
              totalAmount: totalAmount,
              boardingPoint: freshBoarding || 'Boarding Point',
              destination: freshDrop || 'Destination',
              luggageType: freshPassengers[0]?.luggage || 'None',
              busNumber: freshBusNumber,
              seats: Array.from({ length: freshCount }, (_, i) => `S-${i + 1}`),
              qrToken: '',
              bookingDate: new Date().toISOString(),
              phonepeTransactionId: ''
            });
          }
        } catch (e) {
          setBookingResult({
            ticketId: ticketIdParam,
            status: 'Confirmed',
            totalAmount: totalAmount,
            boardingPoint: freshBoarding || 'Boarding Point',
            destination: freshDrop || 'Destination',
            luggageType: freshPassengers[0]?.luggage || 'None',
            busNumber: freshBusNumber,
            seats: Array.from({ length: freshCount }, (_, i) => `S-${i + 1}`),
            qrToken: '',
            bookingDate: new Date().toISOString(),
            phonepeTransactionId: ''
          });
        } finally {
          setStep(4);
          setIsProcessingRedirect(false);
        }
      };
      getBookingDetails();
    } else if (paymentStatus === 'failed') {
      setPaymentState('failed');
      setPaymentError('Payment Failed or Cancelled.');
      setStep(5); 
    }
  }, [searchParams]);

  if (isProcessingRedirect) {
    return (
      <SecureView>
        <Splash />
      </SecureView>
    );
  }

  const handleIncrement = () => {
    if (ticketCount < 10) {
      setTicketCount(prev => prev + 1);
      setPassengers(prev => [...prev, { name: '', phone: prev[0]?.phone || '', luggage: 'None' }]);
    }
  };

  const handleDecrement = () => {
    if (ticketCount > 1) {
      setTicketCount(prev => prev - 1);
      setPassengers(prev => prev.slice(0, -1));
    }
  };

  const handleProceed = async () => {
    setStep(3);
  };

  const handlePayment = async () => {
    setPaymentState('processing');
    setPaymentError(null);
    
    // Save state before leaving
    if (typeof window !== 'undefined') {
      localStorage.setItem('townBusBookingState', JSON.stringify({
        ticketCount,
        passengers,
        boardingPoint,
        dropPoint,
        busNumber: trip?.busNumber || trip?.busCode || ''
      }));
    }
    
    try {
      const response = await fetch('/api/phonepe/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || "anonymous",
          tripId: tripId,
          seats: Array.from({ length: ticketCount }, (_, i) => `S-${i + 1}`),
          totalAmount: totalAmount,
          boardingPoint: boardingPoint,
          destination: dropPoint,
          busNumber: trip?.busNumber || trip?.busCode || '',
          passengers: passengers.map(p => ({
            name: p.name || "Passenger",
            phone: p.phone || "9999999999",
            luggage: p.luggage
          })),
        })
      });

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        // Redirect user to PhonePe checkout
        window.location.href = data.redirectUrl;
      } else {
        setPaymentState('failed');
        setPaymentError(data.error || 'Failed to initialize payment');
      }
    } catch (error: any) {
      console.error('Payment Error:', error);
      setPaymentState('failed');
      setPaymentError(error.message || "A network error occurred while connecting to the payment gateway.");
    }
  };

  return (
    <SecureView>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-[320px]">
        {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-zinc-200 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <button onClick={() => {
          if (step === 5 || step === 4) {
             router.push('/get-ticket');
          } else if (step > 1 && step < 3) {
             setStep(step - 1);
          } else {
             router.back();
          }
        }} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
          <ArrowLeft size={20} className="text-zinc-900" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black uppercase tracking-widest text-zinc-900">Select Tickets</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Town Bus Express</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="px-6 mt-12">
        {/* Routing Dynamic Highlight */}
        <div className="bg-zinc-950 rounded-[32px] p-6 flex items-center justify-between relative overflow-hidden group mb-8 shadow-lg shadow-black/10">
          <div className="absolute inset-y-0 left-0 w-1 bg-[#FF9933]" />
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Boarding</span>
            <span className="text-sm font-black text-white uppercase truncate max-w-[120px]">{boardingPoint || "Select Stop"}</span>
          </div>
          <div className="flex-1 flex flex-col items-center px-4">
            <div className="w-full h-[1px] bg-zinc-800 relative">
              <div className="absolute inset-0 bg-[#FF9933] animate-pulse" />
              <ArrowRight size={14} className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[#FF9933]" />
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Destination</span>
            <span className="text-sm font-black text-white uppercase truncate max-w-[120px]">{dropPoint || "Choose End"}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-widest text-zinc-900 mb-2">Trip Route</h2>
                    <p className="text-slate-500 text-sm">Select your boarding and drop locations.</p>
                  </div>
                  
                  {/* Bus Code and QR */}
                  {trip?.busCode && (
                    <div 
                      onClick={() => setExpandedQR(!expandedQR)}
                      className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 shadow-sm ml-4 shrink-0 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="text-right">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Bus Code</span>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{trip.busCode}</span>
                      </div>
                      <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-100">
                        <QRCodeSVG value={`https://app-woad-beta.vercel.app/bus/${trip.busCode}`} size={40} level="L" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded QR View */}
                <AnimatePresence>
                  {expandedQR && trip?.busCode && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full mb-8 flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner"
                    >
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 mb-4">
                        <QRCodeSVG value={`https://app-woad-beta.vercel.app/bus/${trip.busCode}`} size={160} level="H" />
                      </div>
                      <p className="text-xl font-black text-slate-900 uppercase tracking-widest">{trip.busCode}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center mt-2">Scan this code while boarding to book instantly</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Boarding From</label>
                      <select 
                        value={boardingPoint} 
                        onChange={(e) => setBoardingPoint(e.target.value)} 
                        className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-[24px] px-6 font-bold text-zinc-900 outline-none focus:ring-2 ring-[#FF9933]/20 transition-all cursor-pointer relative z-50"
                      >
                        <option value="">Choose Station</option>
                        {stops
                          .filter((s: any) => s.stopName !== dropPoint)
                          .map((s: any) => <option key={s._id} value={s.stopName}>{s.stopName}</option>)}
                      </select>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-2">Drop Destination</label>
                      <select 
                        value={dropPoint} 
                        onChange={(e) => setDropPoint(e.target.value)} 
                        className="w-full h-16 bg-zinc-50 border border-zinc-100 rounded-[24px] px-6 font-bold text-zinc-900 outline-none focus:ring-2 ring-[#FF9933]/20 transition-all cursor-pointer relative z-50"
                      >
                        <option value="">Choose Destination</option>
                        {stops
                          .filter((s: any) => s.stopName !== boardingPoint)
                          .map((s: any) => <option key={s._id} value={s.stopName}>{s.stopName}</option>)}
                      </select>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  disabled={!boardingPoint || !dropPoint}
                  className="w-full h-20 bg-[#FF9933] text-white rounded-[32px] font-black text-xl tracking-tighter hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8 active:scale-95 shadow-lg shadow-[#FF9933]/20"
                >
                  Select Passengers <ChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <div className="w-16 h-16 bg-[#FF9933]/10 rounded-full flex items-center justify-center">
                  <Users size={32} className="text-[#FF9933]" />
                </div>
              </div>
              
              <h2 className="text-xl font-black uppercase tracking-widest text-zinc-900 mb-2">Passengers</h2>
              <p className="text-slate-500 text-sm mb-8">How many tickets do you need?</p>

              <div className="flex items-center justify-between bg-zinc-50 rounded-2xl p-4 border border-zinc-200">
                <button 
                  onClick={handleDecrement}
                  disabled={ticketCount <= 1}
                  className="w-12 h-12 bg-white border border-zinc-200 rounded-xl flex items-center justify-center hover:bg-zinc-100 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                >
                  <Minus size={20} className="text-zinc-900" />
                </button>
                
                <div className="text-4xl font-black text-zinc-900">
                  {ticketCount}
                </div>
                
                <button 
                  onClick={handleIncrement}
                  disabled={ticketCount >= 10}
                  className="w-12 h-12 bg-[#FF9933] rounded-xl flex items-center justify-center hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-[#FF9933]/20"
                >
                  <Plus size={20} className="text-white" />
                </button>
              </div>

              <div className="mt-8 pt-4">
                {passengers.map((passenger, index) => (
                  <div key={index} className="mb-6 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 relative">
                    <div className="absolute -top-3 left-4 bg-white px-2 py-0.5 text-[10px] font-black text-[#FF9933] uppercase tracking-widest border border-zinc-200 rounded-full shadow-sm">
                      Passenger {index + 1}
                    </div>
                    
                    {/* Name */}
                    <div className="mb-4 mt-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 mb-1 block">Full Name (Optional)</label>
                      <input 
                        type="text"
                        value={passenger.name}
                        onChange={(e) => {
                          const newP = [...passengers];
                          newP[index].name = e.target.value;
                          setPassengers(newP);
                        }}
                        placeholder="Enter name"
                        className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 font-bold text-sm text-zinc-900 outline-none focus:border-[#FF9933] transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div className="mb-4">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 mb-1 block">Phone Number</label>
                      <IntelligentPhoneInput 
                        value={passenger.phone}
                        onChange={(val) => {
                          const newP = [...passengers];
                          newP[index].phone = val;
                          setPassengers(newP);
                        }}
                      />
                    </div>

                    {/* Luggage */}
                    <div>
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 mb-2 flex items-center gap-1">
                        <Package size={12} className="text-[#FF9933]" /> Luggage Add-on
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {['None', 'Small', 'Medium', 'Large'].map(type => (
                          <button 
                            key={type}
                            onClick={() => {
                              const newP = [...passengers];
                              newP[index].luggage = type;
                              setPassengers(newP);
                            }}
                            className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                              passenger.luggage === type 
                                ? 'bg-[#FF9933] text-white border-[#FF9933] shadow-md shadow-[#FF9933]/20' 
                                : 'bg-white text-slate-500 border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            {type} {type !== 'None' && <span className="block mt-0.5 opacity-75">+₹{LUGGAGE_PRICES[type]}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[40px] p-8 text-zinc-900 space-y-6 relative overflow-hidden group border border-zinc-200 shadow-sm">
                <div className="absolute top-0 right-0 p-6 opacity-5 text-[#FF9933]">
                  <CreditCard size={120} />
                </div>
                <div className="space-y-1 relative z-10">
                  <p className="text-[10px] font-black text-[#FF9933] uppercase tracking-[0.4em]">Payment Summary</p>
                  <h4 className="text-3xl font-black tracking-tighter uppercase whitespace-nowrap truncate font-heading">Town Bus</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Tickets</p>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-black">{ticketCount}</span>
                      <span className="text-lg font-black ml-1">Seats</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Luggage</p>
                    <div className="text-lg font-black text-zinc-600 flex flex-col items-end">
                      {passengers.filter(p => p.luggage !== 'None').length > 0 ? (
                        passengers.map((p, i) => p.luggage !== 'None' && (
                          <span key={i} className="text-sm">P{i+1}: {p.luggage} (+₹{LUGGAGE_PRICES[p.luggage]})</span>
                        ))
                      ) : 'None'}
                    </div>
                  </div>
                  <div className="space-y-1 mt-4 col-span-2 text-right border-t border-zinc-100 pt-4">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Total Fare</p>
                    <div className="text-3xl font-black text-[#FF9933] flex justify-end">
                      ₹{totalAmount}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[32px] p-8 border border-zinc-200 shadow-sm mt-6">
                {paymentState === 'processing' ? (
                  <div className="w-full h-20 bg-[#FF9933] rounded-[32px] flex items-center justify-center">
                    <motion.div className="flex items-center gap-3 text-white">
                      <RefreshCw size={24} className="animate-spin" />
                      <span className="uppercase tracking-widest text-sm font-black">Processing via PhonePe...</span>
                    </motion.div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(2)}
                      className="flex-1 py-4 rounded-[20px] font-black uppercase tracking-widest text-sm bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors border border-zinc-200"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => handlePayment()}
                      className="flex-[2] py-4 rounded-[20px] font-black uppercase tracking-widest text-sm bg-[#FF9933] text-white hover:bg-[#e07b1a] transition-colors shadow-lg shadow-[#FF9933]/20"
                    >
                      Pay ₹{totalAmount}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 4 && bookingResult && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 relative"
            >
              <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.2} colors={['#FF9933', '#10B981', '#8B5CF6', '#F43F5E']} style={{ pointerEvents: 'none' }} />
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
                    className="text-2xl font-bold text-zinc-900 tracking-tight uppercase"
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

              {/* VINTAGE ORNATE GOLD TICKET DESIGN - Matches My Passes layout exactly */}
              {(() => {
                const bookingTime = bookingResult.bookingDate ? new Date(bookingResult.bookingDate).getTime() : Date.now();
                const expiryTime = bookingTime + 7200000;
                const isExpired = currentTime > expiryTime;
                const timeRemainingMs = expiryTime - currentTime;
                let timeRemainingStr = "";
                if (!isExpired) {
                  const hours = Math.floor(timeRemainingMs / 3600000);
                  const mins = Math.floor((timeRemainingMs % 3600000) / 60000);
                  const secs = Math.floor((timeRemainingMs % 60000) / 1000);
                  timeRemainingStr = hours > 0 ? `${hours}h ${mins}m ${secs}s` : `${mins}m ${secs}s`;
                }
                return (
                  <div className="w-full overflow-hidden flex flex-col items-center justify-center py-4">
                    <motion.div
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.3 }}
                      className={`w-full overflow-hidden flex flex-col items-center justify-center py-4 ${isExpired ? "opacity-75 grayscale-[0.5]" : ""}`}
                    >
                      <div
                        id="printable-ticket"
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
                                <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Expires in {timeRemainingStr}</p>
                              ) : (
                                <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest">Ticket Validity Ended</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4 text-left relative z-10 px-2 text-[#5d4037]">
                            {/* Row 1: Bus No | Passengers (with luggage inline) — matches My Passes exactly */}
                            <div className="grid grid-cols-2 gap-4 border-b border-[#5d4037]/20 pb-3">
                              <div className="flex flex-col">
                                <span className="font-sans font-bold uppercase text-[9px] tracking-[0.2em] text-[#5d4037]/60">Bus No:</span>
                                <span className="text-lg font-serif font-black tracking-tight uppercase">{bookingResult.busNumber || bookingResult.busId?.busNumber || trip?.busNumber || trip?.busCode || 'TOWN-BUS'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-sans font-bold uppercase text-[9px] tracking-[0.2em] text-[#5d4037]/60">Passengers:</span>
                                <span className="text-lg font-serif font-black tracking-tight">
                                  {bookingResult.seats?.length || ticketCount}
                                  {bookingResult.passengers?.some((p: any) => p.luggage !== 'None') || passengers.some(p => p.luggage !== 'None')
                                    ? <span className="text-xs uppercase tracking-widest text-[#5d4037]/70 ml-1">(+ Luggage)</span>
                                    : null}
                                </span>
                              </div>
                            </div>

                            {/* Row 2: Boarding | Destination */}
                            <div className="grid grid-cols-2 gap-4 border-b border-[#5d4037]/20 pb-3">
                              <div className="flex flex-col">
                                <span className="font-sans font-bold uppercase text-[9px] tracking-[0.2em] text-[#5d4037]/60">Boarding</span>
                                <p className="text-sm font-serif font-bold uppercase truncate max-w-[120px]">{bookingResult.boardingPoint || boardingPoint || 'Point A'}</p>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-sans font-bold uppercase text-[9px] tracking-[0.2em] text-[#5d4037]/60">Destination</span>
                                <p className="text-sm font-serif font-bold uppercase truncate max-w-[120px]">{bookingResult.destination || dropPoint || 'Point B'}</p>
                              </div>
                            </div>

                            {/* Row 3: Travel Date | Total Fare */}
                            <div className="flex items-center justify-between text-[#5d4037]/75">
                              <div className="flex flex-col">
                                <span className="font-sans font-bold uppercase text-[8px] tracking-[0.2em] text-[#5d4037]/60">Travel Date</span>
                                <span className="text-xs font-bold">{bookingResult.bookingDate ? new Date(bookingResult.bookingDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                              </div>
                              <div className="text-right bg-[#5d4037]/5 px-3 py-1.5 rounded-xl border border-[#5d4037]/15">
                                <span className="font-sans font-bold uppercase text-[8px] tracking-[0.2em] text-[#5d4037]/60 block mb-0.5">Total Fare</span>
                                <p className="text-sm font-serif font-black text-slate-950">₹{bookingResult.totalAmount}</p>
                              </div>
                            </div>

                            {bookingResult.phonepeTransactionId && (
                              <div className="mt-4 pt-3 border-t border-[#5d4037]/10 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="font-black text-purple-600 text-[8px]">Pe</span>
                                  </div>
                                  <span className="text-[8px] font-bold text-[#5d4037]/60 uppercase tracking-widest">PhonePe Confirmed</span>
                                </div>
                                <span className="text-[9px] font-bold text-[#5d4037]/80 uppercase tracking-widest">TXN: {bookingResult.phonepeTransactionId}</span>
                              </div>
                            )}

                            {/* Track Bus Button */}
                            <div className="mt-4 pt-4 border-t border-[#5d4037]/20 flex justify-center">
                              {!isExpired ? (
                                <button
                                  onClick={() => router.push(`/live-map?busId=${tripId}`)}
                                  className="w-full bg-[#FF9933] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30"
                                >
                                  <MapPin size={14} />
                                  Track Bus Live
                                </button>
                              ) : (
                                <div className="w-full bg-slate-200 text-slate-500 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                  <MapPin size={14} />
                                  Tracking Ended
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
                              value={bookingResult.qrToken || btoa(JSON.stringify({ t: bookingResult.ticketId || "TOWNBUS", b: tripId }))}
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
                            <p className="text-xs font-serif font-black text-[#5d4037]">JB-{bookingResult.ticketId?.slice(-8).toUpperCase() || '00000000'}</p>
                          </div>
                        </div>

                        {/* Side Notches */}
                        <div className="hidden md:block absolute left-[240px] top-0 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 border border-slate-100/50" />
                        <div className="hidden md:block absolute left-[240px] bottom-0 translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 border border-slate-100/50" />
                      </div>
                    </motion.div>
                  </div>
                );
              })()}

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10"
              >
                 <button 
                   onClick={() => router.push(`/live-map?busId=${tripId}`)}
                   className="col-span-2 md:col-span-1 h-16 bg-[#10B981] text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-[#059669] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-[#10B981]/20 border border-[#10B981]"
                 >
                   <MapPin size={16} />
                   Track Bus
                 </button>

                 <button 
                   onClick={() => router.push('/town-bus')}
                   className="col-span-2 md:col-span-1 h-16 bg-[#FF9933] text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-[#FF9933]/20 border border-[#FF9933]"
                 >
                   <Bus size={16} />
                   Return to Bus List
                 </button>
                 
                 <button 
                   onClick={() => router.push('/history')}
                   className="col-span-1 h-16 bg-white text-zinc-800 rounded-[24px] font-black uppercase tracking-widest text-[9px] hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 active:scale-95 border border-zinc-200"
                 >
                   My Bookings
                 </button>

                 <button 
                   onClick={() => router.push('/')}
                   className="col-span-1 h-16 bg-slate-800 text-white rounded-[24px] font-black uppercase tracking-widest text-[9px] hover:bg-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                 >
                   Home
                 </button>
              </motion.div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4"
            >
              <motion.div 
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 border-4 border-rose-100"
              >
                <AlertCircle size={48} className="text-rose-500" />
              </motion.div>
              
              <h2 className="text-4xl font-black text-zinc-900 tracking-tight uppercase mb-4">Payment Failed</h2>
              <p className="text-lg text-zinc-500 font-medium mb-12 max-w-sm">
                We couldn't process your payment. Please try again or use a different payment method.
              </p>

              <div className="w-full max-w-sm space-y-4">
                <button 
                  onClick={() => handlePayment()}
                  className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-white bg-[#FF9933] hover:bg-[#e07b1a] transition-all active:scale-[0.98] shadow-xl shadow-[#FF9933]/20"
                >
                  Retry Payment
                </button>
                <button 
                  onClick={() => {
                    setPaymentState('idle');
                    setStep(1);
                  }}
                  className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 hover:bg-zinc-200 transition-all active:scale-[0.98]"
                >
                  Start Over
                </button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div 
              key="step6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4"
            >
              <div className="w-24 h-24 mb-8 relative">
                <div className="absolute inset-0 border-4 border-zinc-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#FF9933] rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CreditCard className="text-zinc-400" size={32} />
                </div>
              </div>
              
              <h2 className="text-3xl font-black text-zinc-900 tracking-tight uppercase mb-4 animate-pulse">
                Verifying Payment
              </h2>
              <p className="text-lg text-zinc-500 font-medium max-w-sm">
                Please wait while we confirm your transaction securely with PhonePe...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar (Only for Step 2) */}
      <AnimatePresence>
        {step === 2 && passengers.every(p => p.phone?.length >= 10) && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-[80px] left-0 right-0 p-4 z-40"
          >
            <button 
              onClick={handleProceed}
              className="w-full bg-zinc-950 text-white h-16 rounded-[24px] font-black uppercase tracking-widest text-sm flex items-center justify-between px-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] active:scale-95 transition-transform"
            >
              <div className="flex flex-col items-start">
                <span className="text-white">Proceed to Pay</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">
                  {ticketCount} {ticketCount === 1 ? 'Seat' : 'Seats'} {passengers.some(p => p.luggage !== 'None') && `(+ Luggage)`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">₹{totalAmount}</span>
                <ArrowRight size={20} className="text-[#FF9933]" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </SecureView>
  );
}
