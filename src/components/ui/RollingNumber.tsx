"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const Digit = ({ value }: { value: string }) => {
  return (
    <div className="relative h-[1.2em] w-[0.6em] overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="absolute inset-0 flex items-center justify-center font-black italic font-ui"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export const RollingNumber = ({ value, prefix = "" }: { value: number; prefix?: string }) => {
  const digits = value.toString().split("");

  return (
    <div className="flex items-center">
      {prefix && <span className="mr-1">{prefix}</span>}
      <div className="flex overflow-hidden">
        {digits.map((digit, i) => (
          <Digit key={digits.length - i} value={digit} />
        ))}
      </div>
    </div>
  );
};
