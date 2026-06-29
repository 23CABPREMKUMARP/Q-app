"use client";

import React, { useEffect } from "react";

export default function SecureView({ children }: { children: React.ReactNode }) {
  // Screenshot protection has been disabled per user request
  return <>{children}</>;
}
