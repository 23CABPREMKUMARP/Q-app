"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, Search, QrCode, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const MatrixIdSearch = () => {
  const [matrixId, setMatrixId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matrixId.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const upperId = matrixId.toUpperCase();
      const res = await fetch(`/api/buses/search?code=${upperId}`);
      const data = await res.json();

      if (data.success && data.bus) {
        router.push(`/live-map?busId=${data.bus._id}`);
      } else {
        setError("Matrix ID not recognized in current fleet grid.");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError("Network sync error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[32px] bg-[#F8FAFC] shadow-2xl border border-zinc-100"
      >
        {/* Background Accents like the poster */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-cyan-400/5 to-[#ffffff] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600" />
        
        <div className="relative p-8 flex flex-col items-center">
          {/* Header Branding */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="w-16 h-16 relative mb-2">
               {/* Small Bus Icon similar to poster */}
               <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-pulse" />
               <Bus className="w-full h-full p-3 text-primary relative z-10" />
            </div>
            <h3 className="text-sm font-black tracking-[0.3em] text-dark-saffron uppercase">Digi Bus Stand</h3>
            <div className="h-px w-12 bg-primary/30" />
          </div>

          <div className="w-full text-center mb-8">
            <h2 className="text-2xl font-bold text-dark-saffron tracking-tight leading-tight">Identify & Book</h2>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2">Enter Unique Matrix ID</p>
          </div>

          {/* Search Field */}
          <form onSubmit={handleSearch} className="w-full space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Zap size={18} className="text-primary group-focus-within:animate-pulse transition-colors" />
              </div>
              <input
                type="text"
                value={matrixId}
                onChange={(e) => setMatrixId(e.target.value.toUpperCase())}
                placeholder="e.g. 1024"
                className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-5 pl-14 pr-6 text-lg font-black tracking-widest text-dark-saffron placeholder:text-zinc-300 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all uppercase"
              />
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-6 left-0 right-0 text-[10px] font-bold text-red-500 uppercase tracking-wider text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={isLoading || !matrixId}
              className="w-full bg-dark-saffron hover:bg-primary text-[#111827] rounded-2xl py-5 font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-dark-saffron/10 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-[#ffffff]/30 border-t-[#ffffff] rounded-full animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-widest text-sm">Quick Book Matrix</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Alternative Footer */}
          <div className="mt-8 pt-8 border-t border-zinc-100 w-full flex flex-col items-center gap-4">
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.push('/live-map?action=scan')}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full border border-zinc-100 hover:bg-[#F8FAFC] hover:shadow-md transition-all group"
                >
                  <QrCode size={14} className="text-zinc-600 group-hover:text-primary" />
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Scan QR instead</span>
                </button>
             </div>
             <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-[0.2em]">Verified Secure by JeffBen Systems</p>
          </div>
        </div>

        {/* Poster Style Bottom Border */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600" />
      </motion.div>
    </div>
  );
};
