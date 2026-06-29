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
    pathname?.startsWith("/conductor")
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
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-6 max-w-7xl h-16 flex items-center justify-between relative">
        
        {/* Left Side: Logos */}
        <a href="/" className="flex items-center gap-4">
          <Image src="/logo2.png" alt="Digi Bus" width={44} height={44} className="object-contain drop-shadow-md" />
          
          <div className="flex flex-col justify-center">
            <span className="font-black text-[13px] tracking-tight text-zinc-900 uppercase leading-[1.1]">
              DIGI <span className="text-[#FF9933]">BUS</span>
            </span>
            <span className="font-black text-[13px] tracking-tight text-zinc-900 uppercase leading-[1.1]">
              STAND
            </span>
          </div>

          <div className="w-[1px] h-8 bg-zinc-300 mx-1"></div>

          <div className="flex flex-col justify-center gap-[2px]">
            <span className="text-[6px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
              Powered By
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-[13px] font-black tracking-tight leading-none">
                <span className="text-zinc-900">JEFF</span><span className="text-[#FF9933]">BEN</span>
              </span>
              <span className="text-[6px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-[2px]">
                Systems
              </span>
            </div>
          </div>
        </a>
        
        {/* Middle: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {links.map(link => {
            const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== "/");
            return (
              <a 
                key={link.href} 
                href={link.href}
                className={`text-[11px] font-black uppercase tracking-[0.1em] transition-all relative py-2 ${
                  isActive ? "text-[#FF9933]" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FF9933] rounded-full"></span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Side: Book Now Pill */}
        <div className="hidden md:flex items-center">
          <a href="/town-bus" className="bg-zinc-950 text-white hover:bg-zinc-800 text-[11px] font-bold uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-lg active:scale-95">
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
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-zinc-200 shadow-xl py-4 flex flex-col gap-2 px-4 animate-in slide-in-from-top-2">
          {links.map(link => {
            const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== "/");
            return (
              <a 
                key={link.href} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-xs font-black uppercase tracking-widest p-4 rounded-xl transition-colors ${
                  isActive ? "bg-[#FF9933]/10 text-[#FF9933]" : "text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <a href="/town-bus" className="bg-zinc-950 text-white hover:bg-black text-xs font-bold uppercase tracking-widest px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-2">
            Book Now <ChevronRight size={16} />
          </a>
        </div>
      )}
    </header>
  );
}
