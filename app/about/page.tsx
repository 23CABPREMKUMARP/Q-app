"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, Youtube, Ticket, ShieldCheck, ChevronRight, 
  Sparkles, Award, Globe as GlobeIcon, CheckCircle2, Shield, Heart, Zap
} from "lucide-react";
import dynamic from "next/dynamic";

const Globe = dynamic(() => import("@/src/registry/magicui/globe").then(m => m.Globe), { ssr: false });

export default function AboutPage() {
  const router = useRouter();

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-28 pt-20 overflow-x-hidden safe-bottom"
    >
      {/* Premium Header */}
      <div className="bg-white border-b border-slate-100 py-6 px-6 sticky top-0 z-40 shadow-sm flex items-center gap-3">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl transition-all">
          <ChevronRight className="rotate-180 text-slate-600" size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">About JeffBen</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transit Intelligence & Operations</p>
        </div>
      </div>

      <div className="px-5 space-y-6 mt-6 max-w-md mx-auto">
        {/* Core Profile Card */}
        <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FF9933]/15 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <Image src="/logo2.png" alt="JeffBen" width={36} height={36} className="object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">JeffBen Systems</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Active Infrastructure</span>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              Pioneering industrial-grade automation, real-time fleet telemetry, and automated fare collection systems for public transit ecosystems across Tamil Nadu.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 text-center">
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-2xl font-bold text-orange-500">100%</p>
                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Telemetry Uptime</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-3">
                <p className="text-2xl font-bold text-orange-500">TN-Wide</p>
                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Fleet Dispatch</p>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Overview Paragraphs */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Corporate Overview</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            JEFFBEN Systems is a premier technology enterprise dedicated to the modernization of public infrastructure through industrial-grade automation. We specialize in the development of sophisticated telemetry and the <strong>Unique Bus Code System</strong> for instant metropolitan transit access.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Our unified ecosystem facilitates a seamless interface between regulatory bodies and the public. By harnessing advanced cloud computation, cross-platform mobility applications, and integrated IoT networks, we ensure high-integrity data accessibility across the transit lifecycle.
          </p>
        </div>

        {/* Dynamic Globe Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden flex flex-col items-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 w-full text-left">Global Transit Footprint</h3>
          <div className="relative w-full h-[220px] bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100">
            <div className="absolute inset-0 bg-orange-500/5 rounded-full blur-[40px] scale-75" />
            <Globe className="relative z-10 w-full h-full scale-105" />
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4">Smart City Telemetry Architecture</span>
        </div>

        {/* Our Vision Card */}
        <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100 shadow-inner text-center space-y-3">
          <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto text-orange-600">
            <Sparkles size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-900">Our Vision</h3>
          <p className="text-xs text-slate-700 italic leading-relaxed font-medium">
            &quot;To architect a comprehensive digital infrastructure for an intelligent, sustainable, and highly efficient public transit network across Tamil Nadu, establishing a global benchmark for smart urban mobility.&quot;
          </p>
        </div>

        {/* Founder Spotlights */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Executive Leadership</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm shrink-0">
              <Image 
                src="/founder.jpg" 
                alt="JeffBen" 
                fill 
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">JeffBen</h4>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Founder & Chief Executive Officer</p>
              <div className="flex gap-2 mt-2">
                <a href="https://youtube.com/@jeffbenofficial" target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-slate-600 transition-all">
                  <Youtube size={14} />
                </a>
                <a href="mailto:jeffbenofficial1@gmail.com" className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-slate-600 transition-all">
                  <Mail size={14} />
                </a>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium pt-2 border-t border-slate-50">
            A distinguished technologist and entrepreneur focused on addressing complex infrastructure challenges through innovation. With deep systems expertise, JeffBen established JEFFBEN Systems to redefine public accessibility and operational fleet efficiency.
          </p>
        </div>

        {/* Services & Solutions Portfolio */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pl-2">Solutions Portfolio</h3>
          
          <div className="grid grid-cols-1 gap-3">
            {[
              { title: "Automated Fare Collection", desc: "End-to-end digital ticketing suite enabling seamless mobile/web booking and instant QR validation." },
              { title: "Real-Time Transit Intel", desc: "Enterprise-grade visibility into network operations featuring high-fidelity arrival predictive modeling." },
              { title: "Fleet Telematics & Tracking", desc: "Advanced GPS telemetry for real-time asset monitoring, enabling passengers to track journeys seamlessly." },
              { title: "QR Smart-Boarding", desc: "Vehicle-specific QR integration allowing passengers to instantly scan and view schedules and validation." }
            ].map((sol, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">{sol.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-1">{sol.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advantages & Capabilities */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">The JeffBen Advantage</h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              "Enterprise-grade automated dispatch",
              "High-fidelity real-time location telemetry",
              "User-centric and accessible designs",
              "Scalable state-wide transit architecture",
              "Smart City integration ready"
            ].map((adv, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span className="text-xs text-slate-700 font-semibold leading-none">{adv}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Overview */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Technology Stack Matrix</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Web & Mobile Apps", "GPS-based telemetry", "Cloud Data Systems", 
              "Secure QR Cryptography", "Real-Time Dispatching Engines"
            ].map((tech, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Institutional Contact Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strategic Partnerships</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
            We invite transit authorities, municipal government bodies, and state-level fleet operators to initiate high-level collaboration on regional infrastructure.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="mailto:jeffbenofficial1@gmail.com" className="px-6 py-3 bg-zinc-950 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md hover:bg-orange-500 transition-all flex items-center gap-2">
              <Mail size={12} /> Contact Us
            </Link>
            <Link href="/get-ticket" className="px-6 py-3 bg-orange-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md hover:bg-zinc-950 transition-all flex items-center gap-2">
              <Ticket size={12} /> Get a Pass
            </Link>
          </div>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest pt-2 border-t border-slate-50">Verification Matrix v2.3.6 • JEFFBEN Systems</p>
        </div>
      </div>
    </motion.main>
  );
}
