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
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
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
          ? "py-3 bg-white/80 premium-blur border-b border-zinc-100 shadow-sm" 
          : "py-6 bg-transparent"
      )}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        {/* Logos */}
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Home" className="relative flex items-center gap-4 group border-r border-zinc-200 pr-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-14 h-14 md:w-20 md:h-20"
            >
              <Image 
                src="/hero-logo.png" 
                alt="Digi Bus Stand Logo" 
                fill 
                className="object-contain mix-blend-multiply"
                priority
              />
            </motion.div>
            <span className="hidden sm:block text-sm md:text-base font-bold uppercase tracking-wide leading-tight">
              <span className="text-zinc-950">Digi Bus</span><br/>
              <span className="text-primary">Stand</span>
            </span>
          </Link>

          <Link href="/" aria-label="JeffBen Systems" className="relative flex flex-col items-center gap-0 group">
            <span className="text-[7px] font-semibold text-zinc-400 uppercase tracking-widest leading-none mb-1">
              Powered By
            </span>
            <div className="flex flex-col -gap-1">
              <span className="text-lg md:text-xl font-bold tracking-tight leading-none">
                JEFF<span className="text-primary">BEN</span>
              </span>
              <span className="text-[8px] font-semibold text-zinc-400 uppercase tracking-wider leading-none">
                Systems
              </span>
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
            className="hidden md:flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide hover:bg-primary transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95"
          >
            Book Now <ChevronRight size={16} />
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
            className="md:hidden p-2 text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
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
            className="absolute top-full left-0 right-0 bg-white border-b border-zinc-100 shadow-2xl md:hidden overflow-hidden"
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
                      : "text-zinc-600 hover:bg-zinc-50"
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
                  className="flex items-center justify-center gap-2 bg-zinc-900 text-white w-full py-4 rounded-2xl text-base font-black uppercase tracking-widest hover:bg-primary transition-all"
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
