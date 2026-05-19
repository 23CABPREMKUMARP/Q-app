"use client";

import React, { useEffect, useRef, useState } from "react";
// import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode"; // Removed for optimization
import { X, Camera, Zap, ShieldCheck, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const scannerRef = useRef<any>(null);
  const isStartingRef = useRef(false);

  useEffect(() => {
    let html5QrCode: any = null;
    mountedRef.current = true;

    const startScanner = async () => {
      if (!mountedRef.current || isStartingRef.current) return;
      
      // Comprehensive cleanup before new attempt
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch (e) {
          // Internal library cleanups sometimes error if DOM is shifting
        }
        scannerRef.current = null;
      }

      isStartingRef.current = true;
      setError(null); // Clear previous errors for fresh attempt
      
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;

        const config = { 
          fps: 15, 
          qrbox: { width: 250, height: 250 }, 
          aspectRatio: 1.0,
          disableFlip: false 
        };

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText: string) => {
            if (mountedRef.current) {
               onScan(decodedText);
               // Graceful stop after successful scan
               if (scanner.isScanning) {
                 scanner.stop().catch(() => {});
               }
            }
          },
          () => {} 
        );
      } catch (err: any) {
        if (!mountedRef.current) return;

        if (err?.name === "NotAllowedError" || err?.toString().includes("Permission denied")) {
          setError("CAMERA PERMISSION DENIED: Please enable camera access in your browser settings.");
        } else {
          // Prevent rapid blinking by ignoring play-pause interrupts and AbortError from quick unmounts
          const errMsg = err?.toString() || "";
          if (
            !errMsg.includes("interrupted by a call to pause") && 
            !errMsg.includes("removed from the document") && 
            err?.name !== "AbortError"
          ) {
            setError("HARDWARE ERROR: Camera failed to initialize. Retrying in 5s...");
            setTimeout(() => { if (mountedRef.current) startScanner(); }, 5000);
          }
        }
        // Only log serious camera initialization failures
        if (err?.name !== "AbortError" && !(err?.toString() || "").includes("removed from the document")) {
           console.error("Camera error:", err);
        }
      } finally {
        isStartingRef.current = false;
      }
    };

    startScanner();

    return () => {
      mountedRef.current = false;
      const html5QrCode = scannerRef.current;
      if (html5QrCode) {
        const shutdown = async () => {
          try {
            if (html5QrCode?.isScanning) {
              await html5QrCode.stop();
              html5QrCode.clear();
            }
          } catch (e) {
            // Ignore library-level cleanup race conditions
          } finally {
            scannerRef.current = null;
          }
        };
        shutdown();
      }
    };
  }, [onScan]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center bg-black/60 premium-blur p-0 sm:p-6 gpu-accelerated"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
        className="relative w-full max-w-sm bg-white premium-blur rounded-t-[40px] sm:rounded-[48px] overflow-hidden shadow-[0_-20px_80px_rgba(0,0,0,0.1)] border-t sm:border-4 border-zinc-200 flex flex-col max-h-[75vh] md:max-h-[85vh] gpu-accelerated"
      >
        <div className="absolute top-6 right-6 z-[3010]">
          <button 
            onClick={() => {
              if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().then(() => onClose());
              } else {
                onClose();
              }
            }}
            className="w-10 h-10 bg-zinc-100 hover:bg-zinc-200 rounded-full flex items-center justify-center transition-all border border-zinc-200"
          >
            <X size={18} className="text-zinc-600 hover:text-zinc-900 transition-colors" />
          </button>
        </div>

        <div className="p-6 sm:p-10 space-y-6 overflow-y-auto no-scrollbar">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
               JeffBen
            </div>
             <h3 className="text-2xl font-black text-zinc-950 tracking-tighter uppercase">FLEET SCAN</h3>
          </div>

          <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-[32px] overflow-hidden bg-black border-2 border-white/5 shadow-2xl ring-1 ring-white/10">
            <div id="reader" className="w-full h-full relative" />
            
            {/* Visual Scanner Frame - Stable Static Frame for Jeffben Branding */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border-2 border-primary/20 rounded-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[85%] h-1 bg-primary shadow-[0_0_35px_rgba(241,135,1,1)] animate-[scan_3s_infinite] rounded-full" />
              
              {/* Stable Corner Accents */}
              <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl opacity-40" />
              <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl opacity-40" />
              <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl opacity-40" />
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl opacity-40" />
            </div>

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center gap-4">
                <Camera size={32} className="text-rose-500" />
                <p className="text-[10px] font-bold text-zinc-500 max-w-[160px] leading-relaxed ">{error}</p>
                <button onClick={onClose} className="px-8 py-3 bg-white text-zinc-950 rounded-xl font-black text-[8px] uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95">Dismiss</button>
              </div>
            )}
          </div>

          <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 space-y-4">
            <div className="flex items-center gap-6 group">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/10 shrink-0">
                <Zap size={20} className="text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none">Manual Entry</p>
                <p className="text-xs font-black text-zinc-950 uppercase leading-snug tracking-tight">Fleet Access Key</p>
              </div>
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Enter Bus Code (e.g. 1024)"
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-4 text-zinc-950 text-xs font-black placeholder:text-zinc-400 focus:outline-none focus:border-primary/50 transition-all uppercase"
                id="manual-code-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    if (val) onScan(val);
                  }
                }}
              />
              <button 
                onClick={() => {
                  const input = document.getElementById('manual-code-input') as HTMLInputElement;
                  if (input.value) onScan(input.value);
                }}
                className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-zinc-950 transition-all active:scale-95 shadow-lg shadow-primary/10"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest text-center ">Type code manually if scanning is unavailable</p>
          </div>
          
          <div className="pb-2 text-center">
             <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest leading-none">Neural-ID v2.3 | JBN-STABLE</p>
          </div>
        </div>
      </motion.div>
      
      <style jsx global>{`
        @keyframes scan {
          0% { top: 15%; }
          50% { top: 85%; }
          100% { top: 15%; }
        }
        #reader__dashboard { display: none !important; }
        #reader { background: black !important; position: relative !important; }
        #reader video { 
          object-fit: cover !important; 
          width: 100% !important; 
          height: 100% !important; 
        }
        /* Suppress internal flickering UI messages from html5-qrcode library */
        #reader > div { display: none !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
};

export default QRScanner;
