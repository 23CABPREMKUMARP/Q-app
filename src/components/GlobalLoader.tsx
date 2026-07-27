"use client";

import React, { useState, useEffect } from "react";
import Splash from "./Splash";

export function GlobalLoader({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 8000); // 8 seconds loading animation
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && <Splash />}
      {children}
    </>
  );
}
