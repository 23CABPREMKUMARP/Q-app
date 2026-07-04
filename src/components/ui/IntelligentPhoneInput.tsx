"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, CheckCircle2, AlertCircle } from "lucide-react";

interface IntelligentPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const IntelligentPhoneInput: React.FC<IntelligentPhoneInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Active Phone Number" 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = value.length === 10;
  const isTyping = isFocused && value.length > 0 && value.length < 10;
  const isError = value.length > 10;

  // Haptic pulse on type
  useEffect(() => {
    if (value.length > 0 && !isValid) {
      // Small container pulse
    }
  }, [value]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-center px-2">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Secure Link (Phone)
        </label>
        <AnimatePresence>
          {isValid && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.8 }}
              className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
            >
              <CheckCircle2 size={10} className="text-emerald-500" />
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Verified Format</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}}
        onClick={handleContainerClick}
        className={`relative h-20 rounded-[28px] bg-[#ffffff] border-2 transition-all duration-500 flex items-center px-6 cursor-text overflow-hidden ${
          isValid 
            ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)]" 
            : isFocused 
              ? "border-primary shadow-[0_0_25px_rgba(241,135,1,0.1)]" 
              : "border-zinc-100"
        }`}
      >
        <Phone size={20} className={`mr-4 transition-colors duration-500 ${isValid ? "text-emerald-500" : isFocused ? "text-primary" : "text-zinc-300"}`} />
        
        <div className="relative flex-1 flex items-center h-full">
          {/* Invisible Real Input */}
          <input
            ref={inputRef}
            type="tel"
            value={value}
            autoComplete="new-password"
            data-lpignore="true"
            name="contact_number_no_autofill"
            onChange={(e) => {
              const clean = e.target.value.replace(/\D/g, "");
              const val = clean.length > 10 ? clean.slice(-10) : clean;
              onChange(val);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="absolute inset-0 opacity-0 z-10 cursor-text"
          />

          {/* Animated Placeholder */}
          <AnimatePresence>
            {value.length === 0 && (
              <motion.span
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                className="absolute left-0 text-zinc-300 font-bold text-base whitespace-nowrap pointer-events-none"
              >
                {placeholder}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Animated Digits */}
          <div className="flex items-center gap-1">
            {value.split("").map((digit, i) => (
              <motion.span
                key={`${i}-${digit}`}
                initial={{ opacity: 0, y: 15, scale: 1.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 400 }}
                className={`text-2xl font-black transition-colors duration-500 font-ui ${isValid ? "text-emerald-600" : "text-dark-saffron"}`}
              >
                {digit}
              </motion.span>
            ))}
            
            {/* Custom Animated Cursor */}
            {isFocused && (
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-1 h-8 bg-primary rounded-full ml-1"
              />
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="ml-4 flex items-center justify-center w-8">
           <AnimatePresence mode="wait">
             {isValid ? (
               <motion.div
                 key="valid"
                 initial={{ scale: 0, rotate: -45 }}
                 animate={{ scale: 1, rotate: 0 }}
                 className="text-emerald-500"
               >
                 <CheckCircle2 size={24} strokeWidth={3} />
               </motion.div>
             ) : isFocused ? (
               <motion.div
                 key="typing"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"
               />
             ) : null}
           </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Dynamic Feedback Text */}
      <AnimatePresence>
        {isFocused && value.length > 0 && value.length < 10 && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[8px] font-black text-primary uppercase tracking-[0.2em] text-center font-heading"
          >
            Awaiting Complete Hub Link ({10 - value.length} Digits Remaining)
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
