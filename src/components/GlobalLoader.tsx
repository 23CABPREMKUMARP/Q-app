"use client";

import React from "react";

export function GlobalLoader({ children }: { children: React.ReactNode }) {
  // Removed artificial delay and splash screen to ensure 0 seconds load time
  return <>{children}</>;
}
