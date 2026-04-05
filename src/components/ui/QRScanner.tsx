"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { X, Camera, Zap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Check if camera permission is available
    if (typeof window !== "undefined") {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = { fps: 25, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScan(decodedText);
          html5QrCode.stop();
        },
        (errorMessage) => {
          // console.log("Scanning...", errorMessage);
        }
      ).catch((err) => {
        setError("Camera access denied or device has no camera.");
        console.error("Camera error:", err);
      });

      return () => {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().catch(console.error);
        }
      };
    }
  }, [onScan]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-6"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-sm bg-zinc-950/95 backdrop-blur-2xl rounded-t-[40px] sm:rounded-[48px] overflow-hidden shadow-[0_-20px_80px_rgba(0,0,0,0.5)] border-t sm:border-4 border-white/5 flex flex-col max-h-[75vh] md:max-h-[85vh]"
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
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all border border-white/5"
          >
            <X size={18} className="text-zinc-400 hover:text-white transition-colors" />
          </button>
        </div>

        <div className="p-6 sm:p-10 space-y-6 overflow-y-auto no-scrollbar">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
               Neural Scan
            </div>
            <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase">FLEET SCAN</h3>
          </div>

          <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-[32px] overflow-hidden bg-black border-2 border-white/5 shadow-2xl ring-1 ring-white/10">
            <div id="reader" className="w-full h-full" />
            
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
                <p className="text-[10px] font-bold text-zinc-500 max-w-[160px] leading-relaxed italic">{error}</p>
                <button onClick={onClose} className="px-8 py-3 bg-white text-zinc-950 rounded-xl font-black text-[8px] uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95">Dismiss</button>
              </div>
            )}
          </div>

          <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 flex items-center gap-6 group">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/10 shrink-0">
              <Zap size={20} className="text-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none">Security Status</p>
              <p className="text-xs font-black text-white uppercase leading-snug tracking-tight">Active Neural-Sync</p>
            </div>
          </div>
          
          <div className="pb-2 text-center">
             <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest leading-none">Neural-ID v2.1 | JBN-CORP</p>
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
        #reader { background: black !important; }
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
