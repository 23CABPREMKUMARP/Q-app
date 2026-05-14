"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
// import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode"; // Removed for optimization
import { ShieldCheck, LogIn, Camera, QrCode, CheckCircle2, AlertTriangle, XCircle, Clock, MapPin, User, ChevronLeft, Volume2, Vibrate } from "lucide-react";
import Image from "next/image";

export default function ConductorPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);
  
  const scannerRef = useRef<any>(null);

  // Simple hardcoded access for demonstration
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "CONDUCTOR2024" || password === "1234") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Unauthorized Matrix Key");
    }
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
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-zinc-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF9933] shadow-[0_0_20px_#FF9933]" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm space-y-8 text-center relative z-10"
        >
          <Image src="/logo2.png" alt="Logo" width={100} height={100} className="mx-auto" />
          <div className="space-y-3">
            <h1 className="text-4xl font-bold uppercase tracking-tight text-zinc-900">Conductor <span className="text-[#FF9933]">Hub</span></h1>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Boarding Verification Terminal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access ID"
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-5 px-6 focus:outline-none focus:ring-4 focus:ring-[#FF9933]/10 focus:border-[#FF9933] transition-all text-center tracking-[0.5em] text-2xl font-bold placeholder:tracking-normal placeholder:text-zinc-200"
              />
              {error && <p className="text-red-600 text-[10px] font-bold uppercase tracking-widest mt-3">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-[#FF9933] text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-900 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-[#FF9933]/20"
            >
              <LogIn size={20} />
              Engage Terminal
            </button>
          </form>
          
          <div className="pt-12 flex items-center justify-center gap-4 text-zinc-800">
             <ShieldCheck size={20} />
             <span className="text-[10px] font-bold uppercase tracking-widest">Endorsed by JeffBen Fleet Authority</span>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-[#FF9933] selection:text-white">
      <header className="p-6 bg-white border-b border-zinc-100 sticky top-0 z-50 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Terminal 01 • Live Secure</span>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="text-[10px] font-bold uppercase tracking-widest text-[#FF9933] px-4 py-2 bg-white border border-[#FF9933]/20 rounded-xl hover:bg-[#FF9933] hover:text-white transition-all shadow-sm"
        >
          Logout
        </button>
      </header>

      <div className="p-6 max-w-lg mx-auto space-y-6">
        {/* Scanner Card */}
        <div className="bg-white border border-zinc-100 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
          {!isScanning ? (
            <div className="flex flex-col items-center justify-center py-6 gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FF9933] blur-[60px] opacity-10" />
                <div className="w-32 h-32 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200 flex items-center justify-center relative z-10">
                   <QrCode size={48} className="text-[#FF9933]" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold uppercase text-zinc-900">Awaiting Scan</h2>
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Align QR inside the frame</p>
              </div>
              <button 
                onClick={() => setIsScanning(true)}
                className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl"
              >
                <Camera size={20} />
                Launch Camera
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
               className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-8 text-center space-y-4"
            >
               <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
               <p className="text-blue-500 font-bold uppercase tracking-widest text-xs">Authenticating Matrix Node...</p>
            </motion.div>
          )}

          {scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl p-8 border-2 transition-all ${
                scanResult.success 
                  ? "bg-green-500/10 border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.1)]" 
                  : scanResult.message?.includes("Used")
                    ? "bg-red-500/10 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
                    : scanResult.message?.includes("Expired")
                      ? "bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_40px_rgba(234,179,8,0.1)]"
                      : "bg-red-500/10 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
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
                    <h3 className={`text-2xl font-bold uppercase ${
                      scanResult.success ? "text-green-600" : scanResult.message?.includes("Expired") ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {scanResult.success ? "VALID PASS" : "INVALID PASS"}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Status: {scanResult.message}</p>
                  </div>
                </div>

                {scanResult.booking && (
                  <div className="w-full grid grid-cols-2 gap-4 mt-4 pt-6 border-t border-zinc-100">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Node ID</p>
                      <p className="text-sm font-black text-zinc-800">{scanResult.booking.ticketId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Seats</p>
                      <p className="text-sm font-black text-zinc-800">{scanResult.booking.seats?.join(", ")}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Bus</p>
                      <p className="text-sm font-black text-zinc-800">{scanResult.booking.bus}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Route</p>
                      <p className="text-sm font-black text-zinc-800 truncate">{scanResult.booking.route}</p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setScanResult(null)}
                  className="w-full mt-4 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                >
                  Clear & Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Stats (Mini Layout) */}
        {!scanResult && !validating && !isScanning && (
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex items-center gap-3 shadow-sm">
                 <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle2 size={16} /></div>
                 <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase">Boarded</p>
                    <p className="text-xl font-black leading-none text-zinc-900">12</p>
                 </div>
              </div>
              <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex items-center gap-3 shadow-sm">
                 <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><User size={16} /></div>
                 <div>
                    <p className="text-[9px] font-black text-zinc-400 uppercase">Pending</p>
                    <p className="text-xl font-black leading-none text-zinc-900">28</p>
                 </div>
              </div>
           </div>
        )}
      </div>
      
      {/* Visual Feedback Overlays */}
      <AnimatePresence>
        {scanResult && scanResult.success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none ring-[20px] ring-green-500/30 z-[100]"
          />
        )}
        {scanResult && !scanResult.success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none ring-[20px] ring-red-500/30 z-[100]"
          />
        )}
      </AnimatePresence>
    </main>
  );
}
