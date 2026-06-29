"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

export function WebHeader() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const [isNative, setIsNative] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    import("@capacitor/core").then(({ Capacitor }) => {
      setIsNative(Capacitor.isNativePlatform());
    }).catch(() => {
      setIsNative(false);
    });
  }, []);

  // Do not render anything until we know the platform to prevent flashes
  if (isNative === null) return null;

  // Hide header completely in native app (app uses MobileBottomNav)
  if (isNative) {
    return null;
  }

  // Also hide on auth and admin pages
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
    { label: "Live Map", href: "/live-map" },
    { label: "Book Tickets", href: "/town-bus" },
    { label: "Passes", href: "/get-ticket" },
    { label: "Scan QR", href: "/scan" },
    { label: "History", href: "/history" },
  ];

  return (
    <header className="sticky top-0 z-[900] w-full bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo2.png" alt="JeffBen" width={28} height={28} className="object-contain" />
          <span className="font-black text-lg tracking-tight text-zinc-900 uppercase">Digi Bus</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map(link => {
            const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== "/");
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-xs font-black uppercase tracking-widest transition-colors ${
                  isActive ? "text-[#FF9933]" : "text-zinc-500 hover:text-[#FF9933]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          <div className="ml-4 border-l border-zinc-200 pl-4 flex items-center">
            {isLoaded && isSignedIn && (
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
            )}
            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <button className="bg-[#FF9933] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-sm">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-4">
            {isLoaded && isSignedIn && (
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
            )}
            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <button className="bg-[#FF9933] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Sign In
                </button>
              </SignInButton>
            )}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-600 active:scale-95 transition-transform p-1">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-zinc-200 shadow-xl py-4 flex flex-col gap-2 px-4 animate-in slide-in-from-top-2">
          {links.map(link => {
            const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== "/");
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-xs font-black uppercase tracking-widest p-4 rounded-xl transition-colors ${
                  isActive ? "bg-[#FF9933]/10 text-[#FF9933]" : "text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
