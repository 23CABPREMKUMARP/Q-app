"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bus } from "lucide-react";

export function GlobalLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we've already shown the loader in this session to avoid annoyance
    const hasLoaded = sessionStorage.getItem("app_has_loaded");
    if (hasLoaded) {
      setIsLoading(false);
      return;
    }

    // Show animation for 2.2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem("app_has_loaded", "true");
    }, 2200); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#FF5F1F] to-[#E64A19] overflow-hidden"
          >
            {/* Background glowing effects */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#ffffff]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#ffffff]/10 rounded-full blur-3xl" />

            {/* Pulsing Bus Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 bg-[#ffffff] rounded-[2rem] flex items-center justify-center shadow-2xl mb-8 relative z-10"
            >
              <Bus size={48} className="text-[#FF5F1F]" />
            </motion.div>

            {/* White Text */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center relative z-10"
            >
              <h1 className="text-3xl font-black text-[#ffffff] tracking-tight mb-3 drop-shadow-md">Smart Thamizha</h1>
              
              {/* Animated Loading Dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-2.5 h-2.5 rounded-full bg-[#ffffff] shadow-sm" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-[#ffffff] shadow-sm" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-[#ffffff] shadow-sm" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
