"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";

export function WebHeader() {
  const pathname = usePathname();
  const [isNative, setIsNative] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    import("@capacitor/core").then(({ Capacitor }) => {
      setIsNative(Capacitor.isNativePlatform());
    }).catch(() => {
      setIsNative(false);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isNative === null) return null;

  if (isNative) {
    return null;
  }

  if (
    pathname?.startsWith("/sign-in") || 
    pathname?.startsWith("/sign-up") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/conductor") ||
    pathname?.startsWith("/history") ||
    pathname?.startsWith("/scan") ||
    pathname?.startsWith("/live-map") ||
    pathname?.startsWith("/get-ticket") ||
    pathname?.startsWith("/town-bus")
  ) {
    return null;
  }

  const links = [
    { label: "Home", href: "/" },
    { label: "Solutions", href: "/#solutions" },
    { label: "Live Map", href: "/live-map" },
    { label: "Passes", href: "/get-ticket" },
    { label: "History", href: "/history" },
    { label: "Scan QR", href: "/scan" },
  ];

  return (
    <header 
      className={`fixed top-0 z-[900] w-full transition-all duration-300 ${
        scrolled ? "bg-[#FFFFFF]/90 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 max-w-7xl h-16 md:h-24 flex items-center justify-between relative">
        
        {/* Left Side: Logos */}
        <a href="/" className="flex items-center shrink-0">
          <img src="/smart-tamizha-logo.png" alt="Smart Tamizha" className="h-10 md:h-14 object-contain" />
        </a>
        
        {/* Middle: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {links.map(link => {
            const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== "/");
            return (
              <a 
                key={link.href} 
                href={link.href}
                className={`text-[14px] font-black uppercase tracking-[0.1em] transition-all relative py-2 ${
                  isActive ? "text-[#FF6D00]" : "text-zinc-600 hover:text-[#1A0B00]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FF6D00] rounded-full"></span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Side: Book Now Pill */}
        <div className="hidden md:flex items-center">
          <a href="/town-bus" className="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm text-[#1A0B00] text-[#1A0B00] hover:bg-[#FF6D00] hover:text-[#FFFFFF] hover:border-[#FF6D00] text-[14px] font-bold uppercase tracking-widest px-8 py-4 rounded-full flex items-center gap-2 transition-all shadow-lg active:scale-95">
            Book Now <ChevronRight size={14} />
          </a>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-600 active:scale-95 transition-transform p-1">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#FFFFFF] border-b border-zinc-200 shadow-xl py-4 flex flex-col gap-2 px-4 animate-in slide-in-from-top-2">
          {links.map(link => {
            const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== "/");
            return (
              <a 
                key={link.href} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-xs font-black uppercase tracking-widest p-4 rounded-xl transition-colors ${
                  isActive ? "bg-[#FF6D00]/10 text-[#FF6D00]" : "text-zinc-500 hover:bg-[#FFFFFF]"
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <a href="/town-bus" className="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm text-[#1A0B00] text-[#1A0B00] hover:bg-[#FF6D00] hover:text-[#FFFFFF] hover:border-[#FF6D00] text-xs font-bold uppercase tracking-widest px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-2">
            Book Now <ChevronRight size={16} />
          </a>
        </div>
      )}
    </header>
  );
}
