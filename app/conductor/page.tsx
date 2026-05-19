
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, LogIn, Camera, QrCode, CheckCircle2, AlertTriangle, XCircle, 
  Clock, MapPin, User, ChevronLeft, Volume2, Vibrate, LayoutDashboard, 
  History, Settings, Bus, Share2, X, Fingerprint, Lock, Shield, KeyRound
} from "lucide-react";
import { BusMatrixQR } from "@/src/components/BusMatrixQR";

import Image from "next/image";

export default function ConductorPanel() {
  const [showQR, setShowQR] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);
  const [activeTab, setActiveTab] = useState("scan");

  // Real-time trip status and telemetry broadcasting states
  const [busDbId, setBusDbId] = useState("");
  const [tripStatus, setTripStatus] = useState("Scheduled");
  const [speed, setSpeed] = useState(0);
  const [lat, setLat] = useState(13.0827);
  const [lng, setLng] = useState(80.2707);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [pathIndex, setPathIndex] = useState(0);

  const routePathCoordinates = [
    { lat: 13.0827, lng: 80.2707 }, // Coimbatore/Chennai route sample coordinates
    { lat: 13.0750, lng: 80.2600 },
    { lat: 13.0680, lng: 80.2500 },
    { lat: 13.0550, lng: 80.2400 },
    { lat: 13.0420, lng: 80.2300 },
    { lat: 13.0300, lng: 80.2200 }
  ];

  // Load Bus details and initialize trip status
  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/buses")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const matchedBus = data.find((b: any) => b.busCode === "1024");
            if (matchedBus) {
              setBusDbId(matchedBus._id);
              setTripStatus(matchedBus.status || "Scheduled");
              setSpeed(matchedBus.speed || 0);
              if (matchedBus.location) {
                setLat(matchedBus.location.lat || 13.0827);
                setLng(matchedBus.location.lng || 80.2707);
              }
            }
          }
        })
        .catch((err) => console.error("Error fetching buses:", err));
    }
  }, [isAuthenticated]);

  // Live GPS simulation loop
  useEffect(() => {
    let interval: any = null;
    if (broadcasting) {
      interval = setInterval(() => {
        setPathIndex((prev) => {
          const nextIndex = (prev + 1) % routePathCoordinates.length;
          const nextCoord = routePathCoordinates[nextIndex];
          setLat(nextCoord.lat);
          setLng(nextCoord.lng);
          
          fetch("/api/conductor/update-trip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              busId: busDbId || "65f02cdcf8dbd5225c588825",
              status: tripStatus,
              speed: speed > 0 ? speed : 45,
              lat: nextCoord.lat,
              lng: nextCoord.lng
            })
          }).catch(console.error);

          return nextIndex;
        });
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [broadcasting, busDbId, tripStatus, speed]);

  const triggerTripBroadcast = async (statusOverride?: string, customText?: string) => {
    try {
      setBroadcastLoading(true);
      const res = await fetch("/api/conductor/update-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: busDbId || "65f02cdcf8dbd5225c588825",
          status: statusOverride || tripStatus,
          speed: speed,
          lat: lat,
          lng: lng,
          customBroadcast: customText || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setBroadcastSuccess(true);
        if (statusOverride) {
          setTripStatus(statusOverride);
        }
        setTimeout(() => setBroadcastSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBroadcastLoading(false);
    }
  };

  
  // Clerk-inspired Tabbed Auth
  const [authRole, setAuthRole] = useState<"conductor" | "clerk">("conductor");
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);

  const scannerRef = useRef<any>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const session = localStorage.getItem("conductorSessionActive");
    if (session === "true") {
      setIsAuthenticated(true);
    } else {
      // Trigger a sleek biometric unlock simulation for native app vibe
      const timer = setTimeout(() => setShowBiometricPrompt(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authRole === "conductor") {
      if (password === "CONDUCTOR2024" || password === "1234") {
        setIsAuthenticated(true);
        setError("");
        localStorage.setItem("conductorSessionActive", "true");
        playBeep(true);
      } else {
        setError("Unauthorized Conductor Key");
        playBeep(false);
      }
    } else {
      if (password === "CLERK99" || password === "9999") {
        setIsAuthenticated(true);
        setError("");
        localStorage.setItem("conductorSessionActive", "true");
        playBeep(true);
      } else {
        setError("Invalid Clerk Authorization Token");
        playBeep(false);
      }
    }
  };

  const handleBiometricSuccess = () => {
    setShowBiometricPrompt(false);
    setIsAuthenticated(true);
    localStorage.setItem("conductorSessionActive", "true");
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    playBeep(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("conductorSessionActive");
    setPassword("");
    setError("");
  };


  useEffect(() => {
    let html5QrCode: any = null;

    const startScanner = async () => {
      if (isAuthenticated && isScanning) {
        // Dynamic Import for Performance
        const { Html5Qrcode } = await import("html5-qrcode");
        
        html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            async (decodedText: string) => {
              handleScanSuccess(decodedText);
              await html5QrCode.stop();
              setIsScanning(false);
            },
            (errorMessage: string) => {
              // ignore failures
            }
          );
        } catch (err) {
          console.error("Camera access failed", err);
          setError("Camera Access Denied");
          setIsScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isAuthenticated, isScanning]);

  const handleScanSuccess = async (token: string) => {
    setValidating(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/bookings/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token, 
          scannedBy: "CONDUCTOR_MOBILE_01",
          location: "Mobile Entry"
        }),
      });

      const data = await res.json();
      setScanResult(data);
      
      // Feedback
      if (data.success) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        playBeep(true);
      } else {
        if (navigator.vibrate) navigator.vibrate([300]);
        playBeep(false);
      }
    } catch (err) {
      console.error("Validation failed", err);
      setError("Network Sync Failed");
    } finally {
      setValidating(false);
    }
  };

  const playBeep = (success: boolean) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(success ? 880 : 220, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-5 text-slate-900 overflow-hidden relative font-sans">
        
        {/* Background Gradient Ornaments */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#FF9933]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#FF9933]/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm space-y-8 relative z-10"
        >
          {/* Clerk Brand Header */}
          <div className="text-center space-y-3">
             <div className="w-14 h-14 bg-[#FF9933] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#FF9933]/20">
                <ShieldCheck className="text-white animate-pulse" size={28} />
             </div>
             <div className="space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">Fleet Authorization</h1>
                <p className="text-slate-400 text-xs font-semibold">Verify credentials to engage transit console</p>
             </div>
          </div>

          {/* Tab Selection Selector (Clerk style) */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200">
            <button 
              onClick={() => { setAuthRole("conductor"); setError(""); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${authRole === "conductor" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              Conductor Port
            </button>
            <button 
              onClick={() => { setAuthRole("clerk"); setError(""); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${authRole === "clerk" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              Clerk Node
            </button>
          </div>

          {/* Secure Form Deck */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.03)] space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                  {authRole === "conductor" ? "Enter Conductor Passkey" : "Enter Clerk Network Token"}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4.5 px-6 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/20 focus:border-[#FF9933] transition-all text-center tracking-[0.4em] text-xl font-black placeholder:tracking-normal placeholder:text-slate-300 text-slate-950"
                  />
                </div>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-rose-500 text-[10px] font-bold uppercase tracking-wider text-center pt-1"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-14 bg-[#FF9933] hover:bg-[#4a1d7c] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <LogIn size={14} /> Engage Secure Link
              </button>
            </form>

            <div className="w-full h-px bg-slate-100" />

            {/* Quick Fingerprint Unlock Trigger */}
            <button 
              onClick={() => setShowBiometricPrompt(true)}
              className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-2xl text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Fingerprint size={16} className="text-[#FF9933]" />
              Use Biometric TouchID
            </button>
          </div>
          
          <div className="text-center">
             <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">
               Secured via JeffBen Verification Network
             </span>
          </div>
        </motion.div>

        {/* Dynamic Biometric Verification Overlay Prompt */}
        <AnimatePresence>
          {showBiometricPrompt && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-5"
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                className="w-full max-w-sm bg-white rounded-t-[40px] sm:rounded-[36px] p-8 space-y-6 shadow-2xl border-t border-slate-100 relative text-slate-800"
              >
                <button 
                  onClick={() => setShowBiometricPrompt(false)}
                  className="absolute top-6 right-6 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-all border border-slate-200"
                >
                  <X size={16} />
                </button>

                <div className="text-center space-y-4 pt-4">
                  <div className="w-16 h-16 bg-[#FF9933]/10 text-[#FF9933] rounded-2xl flex items-center justify-center mx-auto border border-[#FF9933]/20 relative">
                    <Fingerprint size={32} className="animate-pulse" />
                    <span className="absolute inset-0 rounded-2xl border border-[#FF9933] animate-ping opacity-30" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">TouchID Required</h3>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                      Authenticate via local device credential key to unlock assigned terminal shift.
                    </p>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button 
                    onClick={handleBiometricSuccess}
                    className="w-full h-14 bg-[#FF9933] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-[#FF9933]/25 active:scale-95 transition-all"
                  >
                    Simulate Fingerprint Scan
                  </button>
                  <button 
                    onClick={() => setShowBiometricPrompt(false)}
                    className="w-full py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center"
                  >
                    Use Passkey Instead
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#FF9933] selection:text-white pb-24 md:pb-0">
      {/* Desktop Header */}
      <header className="hidden md:flex p-6 bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Terminal 01 • Live Secure</span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-[10px] font-bold uppercase tracking-widest text-[#FF9933] px-4 py-2 bg-white border border-[#FF9933]/20 rounded-xl hover:bg-[#FF9933] hover:text-white transition-all shadow-sm"
        >
          Logout
        </button>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex flex-col bg-white border-b border-slate-100 sticky top-0 z-50 px-5 py-4 safe-top shadow-sm">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-[#FF9933] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF9933]/20">
                  <Image src="/logo2.png" alt="JB" width={24} height={24} className="invert brightness-0" />
               </div>
               <div>
                  <h2 className="text-sm font-bold text-slate-900">Conductor Terminal</h2>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Active Shift • 01</span>
                  </div>
               </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl text-slate-600 transition-colors"
            >
               <LogIn size={18} className="rotate-180" />
            </button>
         </div>
      </header>

      <div className="md:p-6 p-4 max-w-lg mx-auto space-y-6">
        
        {/* Vehicle Identity Info */}
        <div className="bg-gradient-to-br from-zinc-950 to-zinc-950/80 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                      <Bus size={20} className="text-primary" />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Assigned Vehicle</p>
                      <h3 className="text-lg font-bold tracking-tight">TN-38-EF-2025</h3>
                   </div>
                </div>
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                   <span className="text-[10px] font-bold text-green-400 uppercase tracking-tight">On Route</span>
                </div>
             </div>
             
             <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                   <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Bus Identification Code</p>
                   <div className="flex items-center gap-2">
                      <span className="text-2xl font-black tracking-tighter text-primary">1024</span>
                      <ShieldCheck size={16} className="text-white/20" />
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Fleet Sync</p>
                   <p className="text-xs font-bold text-white/80">99.2% Healthy</p>
                </div>
             </div>
             <button 
                onClick={() => setShowQR(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all group"
             >
                <Share2 size={14} className="text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Present Matrix QR</span>
             </button>
          </div>
        </div>

        {/* Tab-conditioned Sub-panels */}
        {activeTab === "scan" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Mobile Stats Grid */}
            <div className="md:hidden grid grid-cols-2 gap-3">
               <div className="bg-white p-4 rounded-2xl border border-zinc-950/10 shadow-sm space-y-1">
                  <p className="text-[10px] font-bold text-zinc-950/40 uppercase tracking-widest">Total Boarded</p>
                  <div className="flex items-baseline gap-1">
                     <span className="text-2xl font-bold text-zinc-950">124</span>
                     <span className="text-[10px] font-bold text-green-500">+12%</span>
                  </div>
               </div>
               <div className="bg-white p-4 rounded-2xl border border-zinc-950/10 shadow-sm space-y-1">
                  <p className="text-[10px] font-bold text-zinc-950/40 uppercase tracking-widest">Revenue</p>
                  <div className="flex items-baseline gap-1">
                     <span className="text-2xl font-bold text-zinc-950">₹124</span>
                     <span className="text-[10px] font-bold text-zinc-950/40">Live</span>
                  </div>
               </div>
            </div>

            {/* Scanner Card */}
            <div className="bg-white border border-zinc-950/10 md:rounded-[32px] rounded-3xl md:p-8 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
              {!isScanning ? (
                <div className="flex flex-col items-center justify-center md:py-6 py-4 md:gap-8 gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#FF9933] blur-[60px] opacity-10" />
                    <div className="md:w-32 md:h-32 w-24 h-24 bg-[#FF9933]/5 rounded-[32px] md:rounded-[40px] border-2 border-dashed border-[#FF9933]/20 flex items-center justify-center relative z-10">
                       <QrCode size={40} className="text-[#FF9933] md:hidden" />
                       <QrCode size={48} className="text-[#FF9933] hidden md:block" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="md:text-2xl text-xl font-bold uppercase text-zinc-950 tracking-tight">Ready to Validate</h2>
                    <p className="text-zinc-950/40 md:text-[10px] text-[11px] font-bold uppercase tracking-widest">Scan passenger ticket QR code</p>
                  </div>
                  <button 
                    onClick={() => setIsScanning(true)}
                    className="w-full bg-[#FF9933] text-white md:py-5 py-4 md:rounded-2xl rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl cursor-pointer"
                  >
                    <Camera size={20} />
                    Launch Scanner
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                   <div id="reader" className="overflow-hidden rounded-2xl border-4 border-[#FF9933] shadow-inner" />
                   <button 
                    onClick={() => setIsScanning(false)}
                    className="w-full bg-red-500/10 text-red-500 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] border border-red-500/20"
                   >
                     Cancel Scan
                   </button>
                </div>
              )}
            </div>

            {/* Status Area */}
            <AnimatePresence mode="wait">
              {validating && (
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="bg-blue-500/10 border border-blue-500/20 rounded-3xl md:p-8 p-6 text-center space-y-4"
                >
                   <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                   <p className="text-blue-500 font-bold uppercase tracking-widest text-xs">Authenticating Matrix Node...</p>
                </motion.div>
              )}

              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-[32px] md:p-8 p-6 border-2 transition-all ${
                    scanResult.success 
                      ? "bg-green-500/10 border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.1)]" 
                      : scanResult.message?.includes("Used")
                        ? "bg-red-500/10 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
                        : scanResult.message?.includes("Expired")
                          ? "bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_40px_rgba(234,179,8,0.1)]"
                          : "bg-red-500/10 border-red-500/50 shadow-[0_0_40_rgba(239,68,68,0.1)]"
                  }`}
                >
                  <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3">
                      {scanResult.success ? (
                         <CheckCircle2 size={48} className="text-green-500" />
                      ) : scanResult.message?.includes("Expired") ? (
                        <Clock size={48} className="text-yellow-500" />
                      ) : (
                        <XCircle size={48} className="text-red-500" />
                      )}
                      <div className="space-y-1">
                        <h3 className={`text-2xl font-bold uppercase tracking-tighter ${
                          scanResult.success ? "text-green-600" : scanResult.message?.includes("Expired") ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {scanResult.success ? "VALID PASS" : "INVALID PASS"}
                        </h3>
                        <p className="md:text-[10px] text-[11px] font-bold uppercase tracking-widest text-zinc-400">Status: {scanResult.message}</p>
                      </div>
                    </div>

                    {scanResult.booking && (
                      <div className="w-full grid grid-cols-2 gap-4 mt-4 pt-6 border-t border-zinc-100">
                        <div className="space-y-1">
                          <p className="md:text-[9px] text-[10px] font-bold uppercase tracking-widest text-zinc-400">Node ID</p>
                          <p className="md:text-sm text-base font-bold text-zinc-950">{scanResult.booking.ticketId}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="md:text-[9px] text-[10px] font-bold uppercase tracking-widest text-zinc-400">Seats</p>
                          <p className="md:text-sm text-base font-bold text-zinc-950">{scanResult.booking.seats?.join(", ")}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="md:text-[9px] text-[10px] font-bold uppercase tracking-widest text-zinc-400">Bus</p>
                          <p className="md:text-sm text-base font-bold text-zinc-950">{scanResult.booking.bus}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="md:text-[9px] text-[10px] font-bold uppercase tracking-widest text-zinc-400">Route</p>
                          <p className="md:text-sm text-base font-bold text-zinc-950 truncate">{scanResult.booking.route}</p>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => setScanResult(null)}
                      className="w-full mt-4 py-4 bg-[#FF9933] text-white md:rounded-2xl rounded-xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-lg cursor-pointer"
                    >
                      Clear & Continue
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Stats */}
            <div className="hidden md:grid grid-cols-2 gap-4">
                <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex items-center gap-3 shadow-sm">
                    <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle2 size={16} /></div>
                    <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase">Boarded</p>
                    <p className="text-xl font-black leading-none text-zinc-950">12</p>
                    </div>
                </div>
                <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex items-center gap-3 shadow-sm">
                    <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><User size={16} /></div>
                    <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase">Pending</p>
                    <p className="text-xl font-black leading-none text-zinc-950">28</p>
                    </div>
                </div>
            </div>
          </motion.div>
        )}

        {/* Live Trip / Broadcasting Dashboard Panel */}
        {activeTab === "dashboard" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
          >
            {/* GPS Telemetry Stream Status */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-950/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${broadcasting ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                    <Share2 className={broadcasting ? "animate-pulse" : ""} size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">GPS Telemetry Stream</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {broadcasting ? "Broadcasting live coordinates" : "Transmission paused"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBroadcasting(!broadcasting)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${broadcasting ? "bg-rose-500 text-white hover:bg-rose-600" : "bg-[#FF9933] text-white hover:bg-orange-600"}`}
                >
                  {broadcasting ? "Stop Stream" : "Start Live"}
                </button>
              </div>

              {/* Coordinates Indicator */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-slate-700 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Latitude</span>
                  <span className="font-mono font-bold">{lat.toFixed(5)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Longitude</span>
                  <span className="font-mono font-bold">{lng.toFixed(5)}</span>
                </div>
              </div>
            </div>

            {/* Shift Trip Status Grid */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-950/10 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Broadcast Trip Status</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Scheduled", icon: Clock, color: "bg-slate-100 text-slate-600 border-slate-200" },
                  { name: "Boarding", icon: Bus, color: "bg-amber-50 text-amber-600 border-amber-200" },
                  { name: "Trip Started", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                  { name: "Reached Stop", icon: MapPin, color: "bg-blue-50 text-blue-600 border-blue-200" },
                  { name: "Arriving Soon", icon: Volume2, color: "bg-purple-50 text-purple-600 border-purple-200" },
                  { name: "Completed", icon: CheckCircle2, color: "bg-rose-50 text-rose-600 border-rose-200" }
                ].map((s) => {
                  const Icon = s.icon;
                  const isActive = tripStatus === s.name;
                  return (
                    <button
                      key={s.name}
                      onClick={() => {
                        triggerTripBroadcast(s.name);
                        playBeep(true);
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center gap-1.5 cursor-pointer ${isActive ? "bg-[#FF9933] border-[#FF9933] text-white shadow-md shadow-orange-500/20 scale-105 font-bold" : `${s.color} hover:scale-102`}`}
                    >
                      <Icon size={18} />
                      <span className="text-[9px] uppercase tracking-tighter leading-none">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Passenger Alert Broadcaster */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-950/10 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Send Broadcast Alert</h3>
              <div className="space-y-3">
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="E.g. We are running 5 minutes late due to traffic, or WiFi is now online."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/20 focus:border-[#FF9933] text-sm text-slate-800 h-24 placeholder:text-slate-400"
                />
                <button
                  onClick={() => {
                    if (!broadcastMessage.trim()) return;
                    triggerTripBroadcast(tripStatus, broadcastMessage);
                    setBroadcastMessage("");
                    playBeep(true);
                  }}
                  disabled={broadcastLoading}
                  className="w-full py-4 bg-slate-950 hover:bg-[#FF9933] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {broadcastLoading ? "Broadcasting..." : "Broadcast Alert to Passengers"}
                </button>
                {broadcastSuccess && (
                  <p className="text-emerald-600 text-[10px] font-bold text-center uppercase tracking-wider">
                    Alert delivered to passenger devices!
                  </p>
                )}
              </div>
            </div>

            {/* Telemetry Dial Controls */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-950/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Speed Telemetry</h3>
                  <p className="text-2xl font-black text-slate-950 tracking-tight mt-1">{speed} <span className="text-xs font-normal text-slate-400">km/h</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const ns = Math.max(0, speed - 5);
                      setSpeed(ns);
                      triggerTripBroadcast(tripStatus);
                    }}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-lg text-slate-700 cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    onClick={() => {
                      const ns = Math.min(100, speed + 5);
                      setSpeed(ns);
                      triggerTripBroadcast(tripStatus);
                    }}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-lg text-slate-700 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Shift Timeline View */}
        {activeTab === "history" && (
          <div className="bg-white rounded-3xl p-6 border border-zinc-950/10 shadow-sm space-y-4 text-left">
            <h3 className="text-sm font-bold text-slate-900">Shift Timeline</h3>
            <div className="space-y-4 pt-2">
              <div className="flex gap-4 items-start">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Shift Started</p>
                  <p className="text-[10px] text-slate-400">Today, 08:30 AM • Shift ID #SF01</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">12 Tickets Scanned Successfully</p>
                  <p className="text-[10px] text-slate-400">Total Validations • Route TN-38</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fleet Config View */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-3xl p-6 border border-zinc-950/10 shadow-sm space-y-4 text-left">
            <h3 className="text-sm font-bold text-slate-900">Fleet Operations Config</h3>
            <p className="text-xs text-slate-500">Authorized Conductor Shift ID: <span className="font-mono font-bold text-slate-800">COND_TN38_EF</span></p>
            <div className="h-px bg-slate-100 my-2" />
            <p className="text-xs text-slate-500">Local Cache: <span className="font-bold text-slate-800">Synced (12 validations pending upload)</span></p>
          </div>
        )}
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 px-6 py-3 flex items-center justify-between z-50 safe-bottom">
         <button 
          onClick={() => setActiveTab("scan")}
          className={`flex flex-col items-center gap-1 ${activeTab === "scan" ? "text-[#FF9933]" : "text-zinc-400"}`}
         >
            <QrCode size={20} />
            <span className="text-[10px] font-bold uppercase">Scanner</span>
         </button>
         <button 
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 ${activeTab === "dashboard" ? "text-[#FF9933]" : "text-zinc-400"}`}
         >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-bold uppercase">Dashboard</span>
         </button>
         <button 
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center gap-1 ${activeTab === "history" ? "text-[#FF9933]" : "text-zinc-400"}`}
         >
            <History size={20} />
            <span className="text-[10px] font-bold uppercase">History</span>
         </button>
         <button 
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center gap-1 ${activeTab === "settings" ? "text-[#FF9933]" : "text-zinc-400"}`}
         >
            <Settings size={20} />
            <span className="text-[10px] font-bold uppercase">Fleet</span>
         </button>
      </nav>
      
      {/* Visual Feedback Overlays */}
      <AnimatePresence>
        {scanResult && scanResult.success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none ring-[12px] md:ring-[20px] ring-green-500/30 z-[100]"
          />
        )}
        {scanResult && !scanResult.success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none ring-[12px] md:ring-[20px] ring-red-500/30 z-[100]"
          />
        )}
      </AnimatePresence>
       <AnimatePresence>
          {showQR && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-6"
            >
               <button 
                 onClick={() => setShowQR(false)}
                 className="absolute top-8 right-8 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
               >
                 <X size={24} />
               </button>
               <BusMatrixQR busCode="1024" busId="bus1" />
               <p className="mt-8 text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Fleet Terminal 01 • Matrix Active</p>
            </motion.div>
          )}
        </AnimatePresence>
    </main>
  );
}

