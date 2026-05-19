"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, QrCode, Ticket, ShieldAlert, History } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Track", href: "/live-map", icon: MapPin },
  { label: "Scan QR", href: "/scan", icon: QrCode, isFab: true },
  { label: "Passes", href: "/get-ticket", icon: Ticket },
  { label: "History", href: "/history", icon: History },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // Don't show nav on auth pages
  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-slate-200 safe-bottom">
      <div className="flex items-center justify-around h-[68px] px-2 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/");

          if (item.isFab) {
            return (
              <div key={item.href} className="relative -top-6 flex flex-col items-center">
                <Link 
                  href={item.href}
                  className="w-[60px] h-[60px] bg-[#5f259f] rounded-full flex items-center justify-center shadow-lg border-[4px] border-[#f3f4f6] active:scale-95 transition-all group relative overflow-hidden"
                  aria-label="Scan Ticket"
                >
                  <Icon className="text-white" size={26} strokeWidth={2.5} />
                </Link>
                <span className="text-[10px] font-semibold text-slate-700 mt-1">
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-95 transition-all relative"
            >
              <div className="relative mb-1">
                <Icon 
                  size={24} 
                  className={cn(
                    "transition-all duration-300", 
                    isActive ? "text-[#5f259f]" : "text-slate-500"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </div>
              <span className={cn(
                "text-[10px] transition-all duration-300",
                isActive ? "text-[#5f259f] font-bold" : "text-slate-500 font-medium"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

