"use client";

import React from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";

interface BusMatrixQRProps {
  busCode: string;
  busId: string;
}

export const BusMatrixQR = ({ busCode, busId }: BusMatrixQRProps) => {
  // The URL that the QR code will point to
  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/live-map?busId=${busId}`;

  return (
    <div className="w-full max-w-sm mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative aspect-[3/4] rounded-3xl overflow-hidden border-[12px] border-[#FF5F1F] bg-[#ffffff] shadow-2xl flex flex-col items-center"
      >
        {/* Background Gradient Ornaments */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#ffffff] via-cyan-50 to-cyan-100 opacity-50" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5F1F]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Top Header Section */}
        <div className="relative z-10 pt-8 pb-4 flex flex-col items-center">
          <div className="w-20 h-20 relative mb-2">
             <Image 
               src="/hero-logo.png" 
               alt="Smart Thamizha Logo" 
               fill 
               className="object-contain"
             />
          </div>
          <h2 className="text-[10px] font-black tracking-[0.2em] text-blue-900 uppercase">Smart Thamizha</h2>
        </div>

        {/* QR Code Section */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-8">
          <div className="p-4 bg-[#ffffff] rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-zinc-100 flex items-center justify-center">
            <QRCodeSVG 
              value={bookingUrl}
              size={200}
              level="H"
              includeMargin={false}
              className="rounded-2xl"
            />
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-[7px] font-black text-blue-900/40 uppercase tracking-[0.4em]">Matrix ID</p>
            <div className="px-10 py-4 bg-[#FF5F1F] rounded-full shadow-[0_20px_50px_rgba(37,99,235,0.4)] border-4 border-[#E5E7EB] transform hover:scale-105 transition-transform">
               <span className="text-[#111827] font-black text-2xl tracking-[0.2em]">{busCode}</span>
            </div>
          </div>
        </div>

        {/* Footer Text Section */}
        <div className="relative z-10 pb-8 pt-4 w-full text-center px-6">
          <h1 className="text-3xl font-black text-blue-950 tracking-tighter leading-none mb-1">
            SCAN AND GET TICKET
          </h1>
          <p className="text-[10px] font-bold text-[#FF5F1F] uppercase tracking-widest">
            Download the Smart Thamizha App
          </p>
        </div>

        {/* Decorative corner cut (top right) */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF5F1F] transform translate-x-8 -translate-y-8 rotate-45 pointer-events-none" />
      </motion.div>
    </div>
  );
};
