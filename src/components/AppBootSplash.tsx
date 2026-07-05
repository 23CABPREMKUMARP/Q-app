"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Splash from "./Splash";

export function AppBootSplash({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoaded, userId } = useAuth();

  // Track page path changes globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const current = sessionStorage.getItem('currentPath');
      if (current && current !== pathname) {
        sessionStorage.setItem('prevPath', current);
      }
      sessionStorage.setItem('currentPath', pathname);
    }
  }, [pathname]);

  // Handle logout or user change clearing cache
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      const savedUser = sessionStorage.getItem('townBusUserId');
      if (userId && savedUser && savedUser !== userId) {
        // User changed
        sessionStorage.removeItem('townBusSearchState');
        sessionStorage.removeItem('townBusScrollY');
        sessionStorage.setItem('townBusUserId', userId);
      } else if (userId) {
        sessionStorage.setItem('townBusUserId', userId);
      } else if (!userId) {
        // User logged out
        sessionStorage.removeItem('townBusSearchState');
        sessionStorage.removeItem('townBusScrollY');
        sessionStorage.removeItem('townBusUserId');
      }
    }
  }, [isLoaded, userId]);

  if (!isLoaded) {
    return <Splash />;
  }

  return <>{children}</>;
}