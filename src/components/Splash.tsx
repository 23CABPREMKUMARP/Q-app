"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Splash() {
  return (
    <div className="fixed inset-0 z-[200] bg-[#A4E5E0] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="relative flex flex-col items-center"
      >
        <div className="flex items-center gap-6 mb-12">
          <div className="relative w-48 h-48">
            <Image src="/hero-logo.png" alt="Digi Bus" fill sizes="96px" className="object-contain" priority />
          </div>
          <div className="w-px h-32 bg-black/20" />
          <div className="relative w-48 h-48">
            <Image src="/logo2.png" alt="JeffBen" fill sizes="96px" className="object-contain mix-blend-multiply" priority />
          </div>
        </div>
        
        <div className="w-48 h-1 bg-black/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-[#ffffff] border border-slate-200 text-black rounded-full"
          />
        </div>
        
        <p className="mt-8 text-black font-bold uppercase tracking-[0.3em] text-[10px] text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-black"
          >
            Welcome to DIGI BUS STAND
          </motion.span> 
          <br/>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="opacity-60 text-[8px] font-black"
          >
            powered by Jeff Ben
          </motion.span>
        </p>
      </motion.div>
    </div>
  );
}
