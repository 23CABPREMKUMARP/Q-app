"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ChevronRight, MapPin, Ticket, QrCode } from "lucide-react";
import { cn } from "@/src/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: null },
  { label: "Solutions", href: "/#solutions", icon: null },
  { label: "Live Map", href: "/live-map", icon: MapPin },
  { label: "Get Ticket", href: "/get-ticket", icon: Ticket },
];

export const Navbar = React.memo(function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
        scrolled 
          ? "py-3 bg-[#FFF5E6]/80 premium-blur border-b border-zinc-100 shadow-sm" 
          : "py-6 bg-transparent"
      )}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        {/* Logos */}
        <div className="flex items-center">
          <Link href="/" aria-label="Home" className="relative flex items-center">
            <div className="relative h-10 w-32 md:h-14 md:w-48">
              <Image 
                src="/smart-tamizha-logo.jpeg" 
                alt="Smart Tamizha Logo" 
                fill 
                sizes="(max-width: 768px) 128px, 192px"
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "text-sm font-semibold uppercase tracking-wide transition-all hover:text-primary relative group",
                pathname === item.href ? "text-primary" : "text-zinc-600"
              )}
            >
              {item.label}
              <span className={cn(
                "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                pathname === item.href ? "w-full" : ""
              )} />
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link 
            href="/get-ticket"
            aria-label="Book Now"
            className="hidden md:flex items-center gap-2 bg-[#FFF5E6] border border-[#E5E7EB] shadow-sm text-[#1A0B00] text-[#1A0B00] px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-[#FF6D00] hover:text-[#FFF5E6] hover:border-[#FF6D00] transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95"
          >
            Book Now <ChevronRight size={16} />
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
            className="md:hidden p-2 text-[#1A0B00] hover:bg-zinc-100 rounded-xl transition-colors"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-[#FFF5E6] border-b border-zinc-100 shadow-2xl md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl transition-all",
                    pathname === item.href 
                      ? "bg-primary/5 text-primary" 
                      : "text-zinc-600 hover:bg-[#FFF5E6]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {item.icon && <item.icon size={20} />}
                    <span className="text-base font-bold uppercase tracking-wide">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="opacity-40" />
                </Link>
              ))}
              
              <div className="mt-4 pt-6 border-t border-zinc-100">
                <Link 
                  href="/get-ticket"
                  className="flex items-center justify-center gap-2 bg-[#FFF5E6] border border-[#E5E7EB] shadow-sm text-[#1A0B00] text-[#1A0B00] w-full py-4 rounded-2xl text-base font-black uppercase tracking-widest hover:bg-[#FF6D00] hover:text-[#FFF5E6] hover:border-[#FF6D00] transition-all"
                >
                  Book Now <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
});
