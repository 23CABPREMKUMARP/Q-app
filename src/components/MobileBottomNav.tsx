"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, QrCode, Ticket, ShieldAlert, History } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Live Map", href: "/live-map", icon: MapPin },
  { label: "Scan QR", href: "/scan", icon: QrCode, isFab: true },
  { label: "Passes", href: "/get-ticket", icon: Ticket },
  { label: "History", href: "/history", icon: History },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const [isNative, setIsNative] = React.useState(false); // Default to false so web users don't see a flash of the navbar

  React.useEffect(() => {
    import("@capacitor/core").then(({ Capacitor }) => {
      setIsNative(Capacitor.isNativePlatform());
    }).catch(() => {
      setIsNative(false);
    });
  }, []);

  // Strict separation: Never show the app navigation bar in a web browser
  if (!isNative) {
    return null;
  }

  // Don't show nav on auth, admin, or conductor pages even in app
  if (
    pathname?.startsWith("/sign-in") || 
    pathname?.startsWith("/sign-up") || 
    pathname?.startsWith("/admin") || 
    pathname?.startsWith("/conductor")
  ) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[999] bg-white/95 premium-blur border-t-2 border-[#8B1E2E]/30 shadow-[0_-8px_30px_rgba(255,153,51,0.1)] safe-bottom">
      <div className="flex items-center justify-around h-[68px] px-2 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/");

          if (item.isFab) {
            return (
              <div key={item.href} className="relative -top-6 flex flex-col items-center">
                <Link 
                  href={item.href}
                  className="w-[60px] h-[60px] bg-gradient-to-tr from-amber-500 to-[#8B1E2E] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(255,153,51,0.4)] border-[4px] border-white active:scale-95 hover:brightness-110 transition-all group relative overflow-hidden"
                  aria-label="Scan Ticket"
                >
                  <Icon className="text-white" size={26} strokeWidth={2.5} />
                </Link>
                <span className="text-[10px] font-bold text-slate-800 mt-1 uppercase tracking-wider scale-90">
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
                    isActive ? "text-[#8B1E2E] scale-110" : "text-slate-500 hover:text-[#8B1E2E]/70"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </div>
              <span className={cn(
                "text-[10px] uppercase tracking-wider font-bold transition-all duration-300 scale-90",
                isActive ? "text-[#8B1E2E]" : "text-slate-500"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-1 w-1.5 h-1.5 bg-[#8B1E2E] rounded-full shadow-[0_0_8px_#8B1E2E]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

