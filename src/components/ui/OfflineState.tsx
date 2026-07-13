"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wifi, RefreshCw } from "lucide-react";

interface OfflineStateProps {
  onRetry?: () => void;
}

export const OfflineState: React.FC<OfflineStateProps> = ({ onRetry }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    if (onRetry) {
      onRetry();
    }
    // Simulate retry delay
    setTimeout(() => {
      setIsRetrying(false);
    }, 1500);
  };

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* 1. Kolam Watermark Background */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="kolam-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              {/* Minimal geometric kolam pattern */}
              <path d="M 60 10 C 80 10 110 40 110 60 C 110 80 80 110 60 110 C 40 110 10 80 10 60 C 10 40 40 10 60 10 Z" fill="none" stroke="#0F172A" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M 60 25 L 95 60 L 60 95 L 25 60 Z" fill="none" stroke="#0F172A" strokeWidth="0.5" />
              <circle cx="60" cy="60" r="15" fill="none" stroke="#0F172A" strokeWidth="1" />
              {/* Central dot */}
              <circle cx="60" cy="60" r="2" fill="#0F172A" />
              {/* Peripheral dots */}
              <circle cx="60" cy="25" r="2" fill="#0F172A" />
              <circle cx="60" cy="95" r="2" fill="#0F172A" />
              <circle cx="25" cy="60" r="2" fill="#0F172A" />
              <circle cx="95" cy="60" r="2" fill="#0F172A" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#kolam-pattern)" />
        </svg>
      </div>

      {/* Floating Particles & Gradient Circles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#FF5F1F]/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-[#0F172A]/5 rounded-full blur-3xl"
        />
        {/* Soft dashed route line */}
        <svg className="absolute left-1/2 top-1/4 -translate-x-1/2 w-[2px] h-1/2 opacity-20" preserveAspectRatio="none">
           <line x1="1" y1="0" x2="1" y2="100%" stroke="#0F172A" strokeWidth="2" strokeDasharray="6 6" />
        </svg>
      </div>

      {/* 2. Temple Skyline Silhouette */}
      <div className="absolute bottom-0 left-0 w-full z-10 opacity-[0.07] pointer-events-none flex justify-center">
        <svg viewBox="0 0 1440 250" className="w-full h-auto max-h-[250px] object-cover" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
          {/* Main Gopuram Base */}
          <path d="M 0 250 L 1440 250 L 1440 220 L 1200 220 L 1150 170 L 1100 220 L 850 220 L 780 80 L 750 80 L 720 20 L 690 80 L 660 80 L 590 220 L 340 220 L 290 170 L 240 220 L 0 220 Z" fill="#0F172A" />
          {/* Main Gopuram Spire (Kalasam) */}
          <rect x="715" y="5" width="10" height="15" rx="3" fill="#0F172A" />
          <path d="M 720 0 L 720 20" stroke="#0F172A" strokeWidth="2" />
          
          {/* Horizontal Tier Lines to give Temple identity */}
          <rect x="675" y="100" width="90" height="6" fill="white" opacity="0.3" />
          <rect x="655" y="140" width="130" height="6" fill="white" opacity="0.3" />
          <rect x="625" y="180" width="190" height="6" fill="white" opacity="0.3" />
        </svg>
      </div>

      {/* 3. Main Scene Container */}
      <div className="relative z-20 flex flex-col items-center max-w-md px-6 text-center mt-[-5vh]">
        
        {/* Animated Wi-Fi Symbol */}
        <div className="mb-6 relative w-20 h-20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 opacity-80">
            {/* Dot */}
            <circle cx="12" cy="20" r="1" fill="#0F172A" />
            {/* Inner arc */}
            <motion.path 
              d="M8.5 16.429a5 5 0 0 1 7 0" 
              animate={{ opacity: [1, 1, 0, 0, 1] }} 
              transition={{ duration: 4, times: [0, 0.4, 0.5, 0.9, 1], repeat: Infinity, ease: "linear" }}
            />
            {/* Middle arc */}
            <motion.path 
              d="M5 12.859a10 10 0 0 1 14 0" 
              animate={{ opacity: [1, 1, 0, 0, 1] }} 
              transition={{ duration: 4, times: [0, 0.2, 0.3, 0.9, 1], repeat: Infinity, ease: "linear" }}
            />
            {/* Outer arc */}
            <motion.path 
              d="M2 8.82a15 15 0 0 1 20 0" 
              animate={{ opacity: [1, 0, 0, 0, 1] }} 
              transition={{ duration: 4, times: [0, 0.1, 0.2, 0.9, 1], repeat: Infinity, ease: "linear" }}
            />
            
            {/* Disconnected Slash */}
            <motion.path 
              d="M3 3l18 18" 
              stroke="#EF4444" 
              strokeWidth="2.5"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: [0, 0, 1, 1, 0], pathLength: [0, 0, 1, 1, 0] }}
              transition={{ duration: 4, times: [0, 0.4, 0.5, 0.9, 1], repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* Modern Tangerine Smart Bus */}
        <motion.div 
          className="relative mb-10 drop-shadow-xl"
          animate={{ 
            y: [0, -4, 0], 
            rotateZ: [-1, 1, -1] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {/* GPS Pin Background shadow */}
          <motion.div 
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/10 rounded-[100%] blur-sm"
            animate={{ scale: [1, 0.85, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <svg viewBox="0 0 200 220" width="160" height="176" xmlns="http://www.w3.org/2000/svg">
            {/* Bus Body Base */}
            <rect x="25" y="20" width="150" height="170" rx="28" fill="#FF5F1F" />
            
            {/* Dark Top Roof */}
            <path d="M 40 20 L 160 20 C 168 20 175 27 175 35 L 175 50 L 25 50 L 25 35 C 25 27 32 20 40 20 Z" fill="#e07b1a" />

            {/* Smart Windshield Glass */}
            <rect x="35" y="45" width="130" height="75" rx="12" fill="#0F172A" />
            {/* Glass reflection */}
            <path d="M 35 60 L 165 45 L 165 55 L 35 70 Z" fill="#ffffff" opacity="0.1" />

            {/* LED Destination Board */}
            <rect x="65" y="30" width="70" height="10" rx="3" fill="#000000" />
            {/* Simulated text dots */}
            <rect x="70" y="33" width="4" height="4" rx="1" fill="#22C55E" />
            <rect x="76" y="33" width="4" height="4" rx="1" fill="#22C55E" />
            <rect x="82" y="33" width="4" height="4" rx="1" fill="#22C55E" />
            <rect x="88" y="33" width="4" height="4" rx="1" fill="#22C55E" />

            {/* Front Grill / Smart Sensor Panel */}
            <rect x="60" y="135" width="80" height="25" rx="8" fill="#0F172A" />
            <rect x="70" y="142" width="60" height="1" fill="#CBD5E1" opacity="0.3" />
            <rect x="70" y="146" width="60" height="1" fill="#CBD5E1" opacity="0.3" />
            <rect x="70" y="150" width="60" height="1" fill="#CBD5E1" opacity="0.3" />

            {/* Glowing LED Headlights */}
            <rect x="35" y="140" width="18" height="14" rx="5" fill="#ffffff" />
            <rect x="147" y="140" width="18" height="14" rx="5" fill="#ffffff" />
            {/* Subtle glow effect around headlights */}
            <circle cx="44" cy="147" r="15" fill="#ffffff" opacity="0.4" />
            <circle cx="156" cy="147" r="15" fill="#ffffff" opacity="0.4" />

            {/* Indicators */}
            <rect x="35" y="156" width="18" height="4" rx="2" fill="#FF5F1F" />
            <rect x="147" y="156" width="18" height="4" rx="2" fill="#FF5F1F" />

            {/* Bumper */}
            <rect x="25" y="170" width="150" height="12" rx="4" fill="#334155" />

            {/* Side Mirrors (Modern sleek style) */}
            <path d="M 25 70 L 12 70 C 8 70 6 72 6 76 L 6 95 C 6 100 8 102 12 102 L 18 102 C 22 102 25 100 25 96 Z" fill="#0F172A" />
            <path d="M 175 70 L 188 70 C 192 70 194 72 194 76 L 194 95 C 194 100 192 102 188 102 L 182 102 C 178 102 175 100 175 96 Z" fill="#0F172A" />

            {/* Wheels */}
            <rect x="35" y="180" width="28" height="30" rx="10" fill="#111827" />
            <rect x="137" y="180" width="28" height="30" rx="10" fill="#111827" />
            {/* Hubcaps */}
            <circle cx="49" cy="195" r="5" fill="#CBD5E1" />
            <circle cx="151" cy="195" r="5" fill="#CBD5E1" />
          </svg>
        </motion.div>

        {/* Text Area */}
        <motion.h1 
          className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          No Internet Connection
        </motion.h1>
        
        <motion.p 
          className="text-sm md:text-base text-[#64748B] font-medium leading-relaxed mb-8 max-w-[280px] md:max-w-[320px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          You're currently offline. Please check your internet connection and try again.
        </motion.p>

        {/* Primary Action Button */}
        <motion.button
          onClick={handleRetry}
          disabled={isRetrying}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#FF5F1F] text-white px-8 py-3.5 rounded-full font-bold shadow-[0_8px_20px_rgba(242,133,0,0.25)] flex items-center justify-center gap-2 hover:bg-[#e07b1a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
        >
          {isRetrying ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            "Retry Connection"
          )}
        </motion.button>

      </div>
    </div>
  );
};
