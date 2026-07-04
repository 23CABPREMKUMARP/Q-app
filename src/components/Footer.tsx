"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Mail, Youtube, Facebook, ArrowUpRight, Phone, MapPin } from "lucide-react";
import { usePathname } from "next/navigation";

export const Footer = React.memo(function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/conductor")) {
    return null;
  }

  return (
    <footer className="bg-[#A4E5E0] text-black pt-24 pb-12 border-t border-slate-300">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div className="space-y-8 col-span-1 md:col-span-2">
            <Link href="/" className="flex flex-col gap-2">
              <span className="text-[9px] font-bold text-black/80 uppercase tracking-widest leading-none">
                Powered By
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight leading-none">
                  <span className="text-black">JEFF</span><span className="text-black">BEN</span>
                </span>
                <span className="text-[10px] font-bold text-black/80 uppercase tracking-wider leading-none">
                  Systems
                </span>
              </div>
            </Link>
            <p className="text-black/90 text-lg leading-relaxed max-w-md font-bold">
              Pioneering industrial-grade automation and real-time telemetry for metropolitan public transit ecosystems. Advancing regional connectivity through intelligent infrastructure.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: <Youtube size={20} />, href: "https://youtube.com/@jeffbenofficial?si=46pT3R8BLOVA9AFP" },
                { icon: <Facebook size={20} />, href: "https://www.facebook.com/share/1C7WBtFHeS/" },
                { icon: <Mail size={20} />, href: "mailto:jeffbenofficial1@gmail.com" },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${social.href.includes('mail') ? 'Email' : social.href.includes('youtube') ? 'Youtube' : 'Facebook'}`}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-2xl bg-[#ffffff] border border-slate-200 shadow-sm text-black border border-slate-300 flex items-center justify-center text-black hover:bg-[#ffffff]/10 transition-all"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-black/80">Platform</h4>
            <nav className="flex flex-col gap-4">
              {[
                { label: "Live Tracking", href: "/live-map" },
                { label: "Conductor Portal", href: "/conductor" },
              ].map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  aria-label={link.label}
                  className="text-black/90 hover:text-black transition-all flex items-center justify-between group"
                >
                  <span className="text-base font-bold">{link.label}</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-black/80">Intelligence Hub</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 text-black"><MapPin size={20} /></div>
                <div className="flex flex-col">
                  <span className="text-black font-bold">Regional Headquarters</span>
                  <span className="text-black/90 text-sm font-bold">Tamil Nadu, India</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 text-black"><Mail size={20} /></div>
                <div className="flex flex-col">
                  <span className="text-black font-bold">Inquiries</span>
                  <span className="text-black/90 text-sm font-bold underline underline-offset-4">jeffbenofficial1@gmail.com</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 text-black"><Phone size={20} /></div>
                <div className="flex flex-col">
                  <span className="text-black font-bold">Support Line</span>
                  <span className="text-black/90 text-sm font-bold">Industrial Telemetry Div.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-slate-300 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-black/70 text-sm font-bold uppercase tracking-widest">
            © {currentYear} JeffBen Systems. All Rights Reserved.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-black hover:text-black text-xs font-bold uppercase tracking-[0.2em] transition-all drop-shadow-sm">Privacy Policy</Link>
            <Link href="/terms" className="text-black hover:text-black text-xs font-bold uppercase tracking-[0.2em] transition-all drop-shadow-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
