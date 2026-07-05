"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { QrCode, ArrowLeft, Bus, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { useState } from "react";
import QRScanner from "@/src/components/ui/QRScanner";
import { useRouter } from "next/navigation";
import { WatermarkOverlay } from "@/src/components/ui/WatermarkOverlay";

export default function ScanPage() {
  const [showScanner, setShowScanner] = useState(true);
  const router = useRouter();

  const handleScan = async (data: string) => {
    setShowScanner(false);
    
    let busId = "";
    let busCode = "";
    
    if (data.includes("/bus/")) {
      busCode = data.split("/bus/")[1].split("?")[0].trim();
    } else if (data.includes("busId=")) {
      busId = data.split("busId=")[1].split("&")[0];
    } else if (data.startsWith("BUS:")) {
      busCode = data.replace("BUS:", "").trim();
    } else {
      // Assume raw string is busCode or busId
      if (data.startsWith("TNB") || data.startsWith("B-")) {
        busCode = data.trim();
      } else {
        busId = data.trim();
      }
    }

    try {
      const queryParams = new URLSearchParams();
      if (busCode) queryParams.append("busCode", busCode);
      if (busId) queryParams.append("busId", busId);

      const res = await fetch(`/api/town-bus/current-trip?${queryParams.toString()}`);
      if (res.ok) {
        const trip = await res.json();
        if (trip && trip._id) {
          router.push(`/town-bus/${trip._id}/seat-selection`);
          return;
        }
      }
      
      // Fallback to live map if no active trip or error
      router.push(`/live-map?${queryParams.toString()}`);
    } catch (err) {
      console.error("Scan processing error:", err);
      router.push(`/live-map?${busId ? `busId=${busId}` : `busCode=${busCode}`}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] text-[#111827] flex flex-col items-center justify-center p-6 relative overflow-hidden secure-content">
      <WatermarkOverlay />
      <AnimatePresence>
        {showScanner && (
          <QRScanner 
            onScan={handleScan} 
            onClose={() => setShowScanner(false)} 
          />
        )}
      </AnimatePresence>

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] -z-10" />
      
      <div className="w-full max-w-md space-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-xs font-black tracking-widest uppercase mb-4"
        >
          <ShieldCheck size={14} />
          Secure Matrix Node
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-black tracking-tighter"
        >
          Scan to <span className="text-orange-600">Board</span>
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="relative aspect-square w-full max-w-[300px] mx-auto group"
        >
          {/* Scanner Target UI */}
          <div className="absolute inset-0 border-2 border-orange-600/30 rounded-[40px] pointer-events-none" />
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-orange-600 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-orange-600 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-orange-600 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-orange-600 rounded-br-3xl" />
          
          <div className="absolute inset-4 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] rounded-[32px] flex items-center justify-center overflow-hidden border border-[#ffffff]/5 shadow-2xl">
            <QrCode size={120} className="text-orange-600/20" />
            <motion.div 
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.8)] z-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-orange-600/5 to-transparent" />
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-zinc-600 text-sm font-medium px-8 leading-relaxed"
        >
          Point your camera at the JeffBen Matrix code located on the bus dashboard to establish a boarding link.
        </motion.p>

        <div className="pt-8 space-y-4">
          {!showScanner && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowScanner(true)}
              className="w-full h-14 bg-[#F8FAFC] text-[#111827] rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#ffffff]/5 cursor-pointer"
            >
              <Bus size={18} />
              Re-open Scanner
            </motion.button>
          )}

          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#ffffff] transition-colors font-bold text-xs uppercase tracking-widest">
            <ArrowLeft size={14} />
            Back to Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
