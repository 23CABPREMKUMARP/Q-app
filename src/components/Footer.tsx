"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Mail, Youtube, Facebook, ArrowUpRight, Phone, MapPin } from "lucide-react";

export const Footer = React.memo(function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-white pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div className="space-y-8 col-span-1 md:col-span-2">
            <Link href="/" className="flex flex-col gap-2">
              <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest leading-none">
                Powered By
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight leading-none">
                  JEFF<span className="text-primary">BEN</span>
                </span>
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider leading-none">
                  Systems
                </span>
              </div>
            </Link>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-md font-medium">
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
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Platform</h4>
            <nav className="flex flex-col gap-4">
              {[
                { label: "Live Tracking", href: "/live-map" },
                { label: "Book Ticket", href: "/get-ticket" },
                { label: "Conductor Portal", href: "/conductor" },
              ].map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  aria-label={link.label}
                  className="text-zinc-400 hover:text-white transition-all flex items-center justify-between group"
                >
                  <span className="text-base font-bold">{link.label}</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Intelligence Hub</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 text-primary"><MapPin size={20} /></div>
                <div className="flex flex-col">
                  <span className="text-white font-bold">Regional Headquarters</span>
                  <span className="text-zinc-400 text-sm">Tamil Nadu, India</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 text-primary"><Mail size={20} /></div>
                <div className="flex flex-col">
                  <span className="text-white font-bold">Inquiries</span>
                  <span className="text-zinc-400 text-sm underline underline-offset-4">jeffbenofficial1@gmail.com</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 text-primary"><Phone size={20} /></div>
                <div className="flex flex-col">
                  <span className="text-white font-bold">Support Line</span>
                  <span className="text-zinc-400 text-sm">Industrial Telemetry Div.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
            © {currentYear} JeffBen Systems. All Rights Reserved.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-[0.2em] transition-all">Privacy Policy</Link>
            <Link href="/terms" className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-[0.2em] transition-all">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
});
