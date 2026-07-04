"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Users, CreditCard, Plus, Minus, ChevronRight, CheckCircle2, Download, RefreshCw, AlertCircle, MapPin, Phone, Package, Bus, X } from 'lucide-react';
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
import { BusCodeSearch } from "@/src/components/BusCodeSearch";
import { PremiumBoardingPass } from "@/src/components/PremiumBoardingPass";
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
  const [expandedQR, setExpandedQR] = useState(false);
  
  const [ticketCount, setTicketCount] = useState(1);
  const [farePerTicket] = useState(1);

  const [step, setStep] = useState(1);
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [passengers, setPassengers] = useState<Array<{ phone: string, luggage: string, destination: string, boarding: string, fare: number }>>([
    { phone: '', luggage: 'None', destination: '', boarding: '', fare: 20 }
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
    const calculateFare = (boarding: string, destination: string) => {
    if (!boarding || !destination) return 20;
    const bIndex = stops.findIndex((s: any) => s.stopName === boarding);
    const dIndex = stops.findIndex((s: any) => s.stopName === destination);
    if (bIndex === -1 || dIndex === -1) return 20;
    const stopsCount = Math.abs(dIndex - bIndex);
    return Math.max(10, stopsCount * 5);
  };
  const totalAmount = passengers.reduce((sum, p) => sum + (p.fare || 20) + (LUGGAGE_PRICES[p.luggage] || 0), 0);
  const { width, height } = typeof window !== 'undefined' ? { width: window.innerWidth, height: window.innerHeight } : { width: 0, height: 0 };
  const [phonePeMethod, setPhonePeMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);

  // Continuous state preservation for Step 1 memory
  useEffect(() => {
    if (typeof window !== 'undefined' && passengers.length > 0) {
      // Only save if it's not the initial mount default state (to avoid overwriting valid cached state)
      // We check if hasLoadedBookingState logic ran, or if they have actively modified it.
      // Easiest is to just save it. The restore effect runs first and sets passengers.
      const currentStored = localStorage.getItem('townBusBookingState');
      let shouldSave = true;
      if (currentStored) {
          try {
              const parsed = JSON.parse(currentStored);
              // Avoid saving empty defaults over populated stored data before restore finishes
              if (parsed.passengers && parsed.passengers.length > 1 && passengers.length === 1 && !passengers[0].phone) {
                  shouldSave = false;
              }
          } catch(e) {}
      }
      
      if (shouldSave) {
          localStorage.setItem('townBusBookingState', JSON.stringify({
            ticketCount,
            passengers,
            busNumber: trip?.busNumber || trip?.busCode || '',
            busCode: trip?.busCode || ''
          }));
      }
    }
  }, [passengers, ticketCount, trip]);

  // Check URL params for post-payment redirect
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    
    // Memory retained intentionally as per user request.

    // Restore state if available
    let hasLoadedBookingState = false;
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('townBusBookingState');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          // Only restore if valid data is present
          if (parsed.passengers && parsed.passengers.length > 0 && parsed.passengers[0].boarding) {
            if (parsed.ticketCount) setTicketCount(parsed.ticketCount);
            setPassengers(parsed.passengers);
            if (parsed.boardingPoint) setBoardingPoint(parsed.boardingPoint);
            hasLoadedBookingState = true;
          }
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
          if (matchedBoarding) {
            setBoardingPoint(matchedBoarding.stopName);
          }
          
          const matchedDrop = findBestMatch(toLoc, stops);
          if (matchedDrop || matchedBoarding) {
            setPassengers([{ 
              phone: '', 
              luggage: 'None', 
              boarding: matchedBoarding?.stopName || '', 
              destination: matchedDrop?.stopName || '',
              fare: 20
            }]);
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
      const freshBoarding = freshState.passengers?.length > 1 ? 'Combined Journey' : freshState.passengers?.[0]?.boarding || '';
      const freshPassengers = freshState.passengers || [{ phone: '', luggage: 'None', destination: '' }];
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
              destination: b.destination || (freshPassengers.length > 1 ? 'Multi-Stop' : freshPassengers[0]?.destination) || 'Destination',
              luggageType: b.luggage_type || b.passengers?.[0]?.luggage || freshPassengers[0]?.luggage || 'None',
              passengers: b.passengers || freshPassengers,
              busNumber: freshBusNumber,
              busCode: b.bus_code || b.passengers?.[0]?.busCode || freshState.busCode || 'N/A',
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
                destination: (freshPassengers.length > 1 ? 'Multi-Stop' : freshPassengers[0]?.destination) || 'Destination',
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
              destination: (freshPassengers.length > 1 ? 'Multi-Stop' : freshPassengers[0]?.destination) || 'Destination',
              luggageType: freshPassengers[0]?.luggage || 'None',
              busNumber: freshBusNumber,
              busCode: freshState.busCode || 'N/A',
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
      const freshBoarding = freshState.passengers?.length > 1 ? 'Combined Journey' : freshState.passengers?.[0]?.boarding || '';
      const freshPassengers = freshState.passengers || [{ phone: '', luggage: 'None', destination: '' }];
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
              destination: b.destination || (freshPassengers.length > 1 ? 'Multi-Stop' : freshPassengers[0]?.destination) || 'Destination',
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
              destination: (freshPassengers.length > 1 ? 'Multi-Stop' : freshPassengers[0]?.destination) || 'Destination',
              luggageType: freshPassengers[0]?.luggage || 'None',
              busNumber: freshBusNumber,
              busCode: freshState.busCode || 'N/A',
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
            destination: (freshPassengers.length > 1 ? 'Multi-Stop' : freshPassengers[0]?.destination) || 'Destination',
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
                className="bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-md transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-[750px] md:w-max flex justify-center items-center relative z-10 transform rotate-90 md:rotate-0 origin-center scale-[0.95] sm:scale-[1] md:scale-100 transition-transform"
              onClick={(e) => e.stopPropagation()}
            >
              <PremiumBoardingPass booking={selectedTicket} currentTime={currentTime} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 relative z-10 text-white text-xs font-bold uppercase tracking-widest opacity-70"
            >
              Tap outside to close
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </SecureView>
    );
  }

  const handleIncrement = () => {
    if (ticketCount < 10) {
      setTicketCount(prev => prev + 1);
      setPassengers(prev => [...prev, { phone: '', luggage: 'None', boarding: prev[prev.length - 1]?.destination || '', destination: '', fare: 20 }]);
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
        busNumber: trip?.busNumber || trip?.busCode || '',
        busCode: trip?.busCode || ''
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
          boardingPoint: passengers.length > 1 ? 'Combined Journey' : passengers[0]?.boarding || '',
          destination: passengers.length > 1 ? 'Multi-Stop' : passengers[0]?.destination || '',
          busNumber: trip?.busNumber || trip?.busCode || '',
          busCode: trip?.busCode || '',
          passengers: passengers.map(p => ({
            phone: p.phone || "9999999999",
            luggage: p.luggage,
            boarding: p.boarding || '',
            destination: p.destination || '',
            fare: p.fare || 20
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
          } else if (step > 1) {
             setStep(1);
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
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Total Journeys</span>
            <span className="text-sm font-black text-white uppercase truncate max-w-[120px]">{passengers.length}</span>
          </div>
          <div className="flex-1 flex flex-col items-center px-4">
            <div className="w-full h-[1px] bg-zinc-800 relative">
              <div className="absolute inset-0 bg-[#FF9933] animate-pulse" />
              <Bus size={14} className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[#FF9933]" />
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Combined Fare</span>
            <span className="text-sm font-black text-white uppercase truncate max-w-[120px]">₹{totalAmount}</span>
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
                  <div className="pr-4">
                    <h2 className="text-xl font-black uppercase tracking-widest text-zinc-900 mb-2">Build Your Journeys</h2>
                    <p className="text-slate-500 text-sm">Add multiple segments to book a combined ticket.</p>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0">
                    <button onClick={() => setExpandedQR(true)} className="p-2 bg-white rounded-xl shadow-sm border border-zinc-200 hover:scale-105 transition-transform">
                      <QRCodeSVG value={`https://jeffben.org/bus/${trip?.busCode || trip?.busNumber || tripId}`} size={64} level="H" />
                    </button>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1 text-center">Boarding<br/>QR</p>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="mb-6 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 relative">
                      <div className="absolute -top-3 left-4 bg-white px-2 py-0.5 text-[10px] font-black text-[#FF9933] uppercase tracking-widest border border-zinc-200 rounded-full shadow-sm flex items-center gap-2">
                        Journey {index + 1}
                        {passengers.length > 1 && (
                          <button onClick={() => {
                            const newP = [...passengers];
                            newP.splice(index, 1);
                            setPassengers(newP);
                            setTicketCount(newP.length);
                          }} className="text-red-500 hover:text-red-700 ml-2">
                            <Minus size={12} />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {/* Boarding */}
                        <div className="mb-4">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 mb-1 block">Boarding Point</label>
                          <select 
                            value={passenger.boarding} 
                            onChange={(e) => {
                              const newP = [...passengers];
                              newP[index].boarding = e.target.value;
                              newP[index].fare = calculateFare(newP[index].boarding, newP[index].destination);
                              setPassengers(newP);
                            }} 
                            className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 font-bold text-sm text-zinc-900 outline-none focus:border-[#FF9933] transition-all cursor-pointer"
                          >
                            <option value="">Choose Start</option>
                            {stops.map((s: any) => <option key={s._id} value={s.stopName}>{s.stopName}</option>)}
                          </select>
                        </div>

                        {/* Destination */}
                        <div className="mb-4">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1 mb-1 block">Drop Point</label>
                          <select 
                            value={passenger.destination} 
                            onChange={(e) => {
                              const newP = [...passengers];
                              newP[index].destination = e.target.value;
                              newP[index].fare = calculateFare(newP[index].boarding, newP[index].destination);
                              setPassengers(newP);
                            }} 
                            className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 font-bold text-sm text-zinc-900 outline-none focus:border-[#FF9933] transition-all cursor-pointer"
                          >
                            <option value="">Choose End</option>
                            {stops
                              .filter((s: any) => s.stopName !== passenger.boarding)
                              .map((s: any) => <option key={s._id} value={s.stopName}>{s.stopName}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1 pl-1">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Phone Number</label>
                          {index > 0 && (
                            <label className="flex items-center gap-1.5 cursor-pointer hover:bg-zinc-100 px-2 py-0.5 rounded transition-colors">
                              <input 
                                type="checkbox" 
                                className="accent-[#FF9933] w-3 h-3 cursor-pointer"
                                onChange={(e) => {
                                  const newP = [...passengers];
                                  if (e.target.checked) {
                                    newP[index].phone = newP[0].phone;
                                  } else {
                                    newP[index].phone = '';
                                  }
                                  setPassengers(newP);
                                }}
                              />
                              <span className="text-[9px] font-bold text-zinc-500 uppercase">Same as Journey 1</span>
                            </label>
                          )}
                        </div>
                        <IntelligentPhoneInput 
                          value={passenger.phone}
                          onChange={(val) => {
                            const newP = [...passengers];
                            newP[index].phone = val;
                            setPassengers(newP);
                          }}
                        />
                      </div>

                      {/* Luggage & Fare */}
                      <div className="flex justify-between items-end">
                        <div className="flex-1">
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
                        <div className="ml-4 text-right">
                           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Fare</span>
                           <span className="text-xl font-black text-zinc-900">₹{passenger.fare || 20}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={handleIncrement}
                    disabled={ticketCount >= 10}
                    className="w-full py-4 border-2 border-dashed border-zinc-300 text-zinc-500 rounded-2xl font-bold uppercase tracking-widest text-xs hover:border-[#FF9933] hover:text-[#FF9933] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add Another Journey
                  </button>
                </div>

                <button 
                  onClick={() => setStep(3)}
                  disabled={passengers.some(p => !p.boarding || !p.destination)}
                  className="w-full h-20 bg-[#FF9933] text-white rounded-[32px] font-black text-xl tracking-tighter hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8 active:scale-95 shadow-lg shadow-[#FF9933]/20"
                >
                  Proceed to Payment <ChevronRight size={24} />
                </button>
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
                      onClick={() => setStep(1)}
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
  onClick={() => setSelectedTicket({
    ...bookingResult,
    busNumber: bookingResult.busNumber || bookingResult.busId?.busNumber || trip?.busNumber || trip?.busCode || 'TOWN-BUS',
    busCode: bookingResult.busCode || bookingResult.busId?.busCode || trip?.busCode || 'N/A',
    boardingPoint: bookingResult.boardingPoint || boardingPoint || 'Point A',
    destination: bookingResult.destination || (passengers.length > 1 ? "Multi-Stop" : passengers[0]?.destination) || 'Point B'
  })}
  className="w-full max-w-sm mx-auto border bg-gradient-to-br from-[#FFD700] via-[#FFF3B0] to-[#D4AF37] border-[#B8860B] shadow-lg shadow-[#D4AF37]/40 rounded-xl p-4 cursor-pointer hover:scale-[1.01] transition-transform active:scale-95 flex flex-col gap-3 relative overflow-hidden"
>
  <div className="flex justify-between items-start">
    <div className="flex flex-col">
      <span className="text-[9px] font-bold text-black uppercase tracking-widest mb-1">Pass No.</span>
      <span className="font-mono font-black text-black/90 text-sm">{bookingResult.ticketId || "PENDING"}</span>
    </div>
    <div className="bg-black/10 px-2 py-1 rounded-md">
      <span className="text-[10px] font-black text-black flex items-center gap-1">
        <Bus size={10} /> Town Bus
      </span>
    </div>
  </div>
  
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mt-2">
    <div className="flex flex-col">
      <span className="text-[8px] font-bold text-black/70 uppercase">From</span>
      <span className="font-bold text-black text-sm truncate">{bookingResult.boardingPoint || boardingPoint || 'Point A'}</span>
    </div>
    <div className="flex flex-col items-center px-2">
      <ArrowRight size={14} className="text-black/50" />
    </div>
    <div className="flex flex-col items-end">
      <span className="text-[8px] font-bold text-black/70 uppercase">To</span>
      <span className="font-bold text-black text-sm truncate text-right">{bookingResult.destination || (passengers.length > 1 ? "Multi-Stop" : passengers[0]?.destination) || 'Point B'}</span>
    </div>
  </div>
  
  <div className="flex justify-between items-end mt-2 pt-3 border-t border-[#B8860B]/30">
    <div className="flex flex-col">
      <span className="text-[8px] font-bold text-black/70 uppercase mb-0.5">Time</span>
      <span className="font-bold text-black text-xs">
        {new Date(bookingTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </span>
    </div>
    <span className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-1">
      Tap to View <ChevronRight size={12} className="text-black/50" />
    </span>
  </div>
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
        {step === 2 && passengers.every(p => p.phone?.length >= 10 && p.destination) && (
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
    
      {/* Expanded QR Modal */}
      <AnimatePresence>
        {expandedQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedQR(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center shadow-2xl relative"
            >
              <button 
                onClick={() => setExpandedQR(false)}
                className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full text-zinc-500 hover:bg-zinc-200"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-black text-zinc-900 uppercase tracking-widest mb-6">Boarding QR</h3>
              
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl mb-6">
                <QRCodeSVG value={`https://jeffben.org/bus/${trip?.busCode || trip?.busNumber || tripId}`} size={200} level="H" />
              </div>
              
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Bus Code</p>
              <p className="text-3xl font-black text-[#FF9933] uppercase tracking-widest">
                {trip?.busCode || trip?.busNumber || tripId}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </SecureView>
  );
}
