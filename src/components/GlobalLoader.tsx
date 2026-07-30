"use client";

import React, { useState, useEffect } from "react";
import Splash from "./Splash";

export function GlobalLoader({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem('skip_splash') === 'true') {
      setShowSplash(false);
      sessionStorage.removeItem('skip_splash');
      return;
    }
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4500); // 4.5 seconds loading animation
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && <Splash />}
      {children}
    </>
  );
}
