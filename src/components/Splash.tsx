"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Splash() {
  return (
    <div className="fixed inset-0 z-[5000] bg-[#FFFFFF] flex flex-col items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Desktop Video */}
        <video 
          src="/videos/web-loading.mp4" 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="hidden md:block w-full h-full object-cover" 
        />
        {/* Mobile Video */}
        <video 
          src="/videos/mobile-loading.mp4" 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="block md:hidden w-full h-full object-contain bg-[#FFFFFF]" 
        />

        {/* Mobile Top Text */}
        <div className="absolute top-12 inset-x-0 flex justify-center z-10 md:hidden pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm"
          >
            <span className="text-[#FF6D00] font-black uppercase tracking-[0.2em] text-xs">
              1st in Tamil Nadu
            </span>
          </motion.div>
        </div>

        {/* Mobile Bottom Text */}
        <div className="absolute bottom-12 inset-x-0 flex justify-center z-10 md:hidden px-8 text-center pointer-events-none">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-[#1A0B00] font-bold text-sm leading-relaxed bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm"
          >
            No need to guess where the bus is...<br/>
            <span className="text-[#FF6D00] text-base mt-1 block">Watch it live on your phone!</span>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
