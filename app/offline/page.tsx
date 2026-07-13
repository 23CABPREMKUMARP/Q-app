import React from "react";
import { OfflineState } from "@/src/components/ui/OfflineState";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "No Internet Connection - Smart Thamizha",
};

export default function OfflinePage() {
  return <OfflineState />;
}
