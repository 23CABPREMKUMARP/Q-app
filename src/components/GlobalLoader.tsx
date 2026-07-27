"use client";

import React, { useState, useEffect } from "react";
import Splash from "./Splash";

export function GlobalLoader({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 10000); // 10 seconds loading animation
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && <Splash />}
      {children}
    </>
  );
}
