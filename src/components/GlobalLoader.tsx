"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function GlobalLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if loader has already been seen in this session
    if (typeof window !== "undefined" && sessionStorage.getItem("hasSeenLoader")) {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hasSeenLoader", "true");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="global-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-[#FF9933] flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-12"
            >
              <div className="flex items-center gap-8">
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1, type: "spring" }}
                  className="relative w-16 h-16 md:w-20 md:h-20"
                >
                  <Image src="/logo2.png" alt="JeffBen" fill sizes="160px" className="object-contain" priority />
                </motion.div>
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="w-px h-20 bg-black/20"
                />
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 1, type: "spring" }}
                  className="relative w-16 h-16 md:w-20 md:h-20"
                >
                  <Image src="/hero-logo.png" alt="Digi Bus Stand" fill sizes="160px" className="object-contain mix-blend-multiply" priority />
                </motion.div>
              </div>

              <div className="space-y-6 text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                  className="text-5xl md:text-7xl font-black tracking-tighter uppercase font-heading"
                >
                  <span className="text-black">Digi Bus</span> <span className="text-white">Stand</span>
                </motion.h1>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 2.2, duration: 2.5, ease: "linear" }}
                  style={{ transformOrigin: "left center", willChange: "transform" }}
                  className="h-1.5 w-full bg-black rounded-full mx-auto"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 2.6 }}
                  className="text-black font-bold uppercase tracking-widest text-[9px]"
                >
                  Powered by <span className="text-black">JeffBen</span>
                </motion.p>
              </div>

              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-[2px] bg-black/5 pointer-events-none"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* We always render children so that they are mounted under the loader and ready when it fades out */}
      <div className={isLoading ? "pointer-events-none fixed inset-0 overflow-hidden" : ""}>
        {children}
      </div>
    </>
  );
}
