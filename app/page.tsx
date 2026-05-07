"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { 
  Mail, Youtube, Facebook, 
  Ticket, ShieldCheck, Lock, X, ChevronRight 
} from "lucide-react";
import dynamic from "next/dynamic";
import { UserButton } from "@clerk/nextjs";

const Globe = dynamic(() => import("@/src/registry/magicui/globe").then(m => m.Globe), { ssr: false });
const AuroraBackground = dynamic(() => import("../src/components/ui/aurora-background").then(m => m.AuroraBackground), { ssr: false });
const ContainerScroll = dynamic(() => import("../src/components/ui/container-scroll-animation").then(m => m.ContainerScroll), { ssr: false });

export default function ProductPage() {
  const router = useRouter();
  const [showPinGate, setShowPinGate] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "445566") {
      router.push("/live-map");
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <main className="relative w-full overflow-x-hidden gpu-accelerated">
      {/* 6-Digit Neural Access Gate */}
      <AnimatePresence mode="wait">
        {showPinGate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] premium-blur bg-zinc-950/90 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl border-2 gpu-accelerated ${error ? "border-rose-500 animate-shake" : "border-zinc-100"}`}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                  <Lock size={24} />
                </div>
                <button onClick={() => setShowPinGate(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors p-2">
                  <X size={24} />
                </button>
              </div>
              
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter mb-2 uppercase italic">Verification Required</h2>
              <p className="text-zinc-500 text-sm font-bold mb-8 uppercase tracking-widest">Enter 6-Digit Command Code</p>
              
              <form onSubmit={handlePinSubmit} className="space-y-6">
                <input 
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  autoFocus
                  placeholder="••••••"
                  className="w-full h-20 bg-zinc-50 border-2 border-zinc-100 rounded-[28px] text-center text-4xl font-black tracking-[0.5em] text-zinc-900 outline-none focus:border-orange-500 transition-all placeholder:text-zinc-200"
                />
                
                <button 
                  type="submit"
                  disabled={pin.length < 6}
                  className="w-full h-20 bg-zinc-900 text-white rounded-[32px] font-black text-xl tracking-tighter hover:bg-orange-500 transition-all flex items-center justify-center gap-3 disabled:opacity-20 active:scale-95 shadow-xl hover:shadow-orange-500/20"
                >
                  Confirm Identity <ChevronRight size={24} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-2 md:top-5 left-0 z-50 flex items-center gap-0 pointer-events-auto cursor-pointer group" onClick={() => setShowPinGate(true)}>
          <Image
            src="/logo2.png"
            alt="JEFFBEN Branding"
            width={500}
            height={200}
            className="h-24 sm:h-28 md:h-36 w-auto object-contain transition-transform group-hover:scale-105 duration-500 px-4 md:px-8 gpu-accelerated"
            priority
          />
      </div>

      <div className="absolute top-0 right-0 z-50 pointer-events-auto cursor-pointer flex">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          viewport={{ once: true }}
          className="gpu-accelerated"
        >
          <div onClick={() => setShowPinGate(true)} className="group">
            <Image
              src="/hero-logo.png"
              alt="JEFFBEN Strategic Emblem"
              width={800}
              height={800}
              className="h-16 sm:h-24 md:h-48 w-auto object-contain mix-blend-multiply drop-shadow-2xl transition-transform group-hover:scale-110 duration-500 cursor-pointer"
              priority
            />
          </div>
        </motion.div>
      </div>

      {/* User Profile / Logout (Desktop Only) */}
      <div className="hidden md:block fixed top-6 right-6 z-[60]">
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: "w-12 h-12 border-2 border-white/20 shadow-xl hover:scale-105 transition-transform",
              userButtonPopoverCard: "bg-[#121212] border border-white/10 text-white",
              userButtonPopoverActionButton: "text-gray-300 hover:bg-white/5",
              userButtonPopoverActionButtonText: "text-gray-300",
              userButtonPopoverFooter: "hidden"
            }
          }}
        />
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center gpu-accelerated">
        {/* Background Bus Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/smart-bus.png"
            alt="Strategic Automated Mobility Infrastructure"
            fill
            sizes="100vw"
            className="object-cover md:object-center opacity-90 transition-transform duration-[2000ms] ease-out"
            priority
          />
          {/* Professional Overlays for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50/80 via-orange-50/40 to-transparent premium-blur" />
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50/20 via-transparent to-orange-50" />
        </div>

        <AuroraBackground className="bg-transparent text-black h-full w-full gpu-accelerated">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 1,
              ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for premium feel
            }}
            viewport={{ once: true }}
            className="relative z-10 flex flex-col items-center justify-start text-center px-6 md:px-24 pt-12 md:pt-24 w-full h-full"
          >
            <div className="max-w-4xl relative">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                viewport={{ once: true }}
                className="text-4xl sm:text-6xl md:text-8xl font-bold bg-gradient-to-b from-black to-zinc-600 bg-clip-text text-transparent tracking-tight leading-tight"
              >
                Welcome to <br className="hidden md:block" />
                <span className="text-black">JEFF</span><span className="text-[#EA580C]">BEN</span> <span className="text-black">Systems</span>
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                viewport={{ once: true }}
                className="mt-6 text-xl sm:text-2xl md:text-4xl font-semibold text-zinc-900 leading-snug"
              >
                Pioneering Intelligence in <br className="hidden md:block" />
                Metropolitan Public Transit Ecosystems
              </motion.h2>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-full bg-black px-10 py-4 text-white text-lg font-medium transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] cursor-pointer gpu-accelerated"
                >
                  Explore Solutions
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AuroraBackground>
        <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.1),rgba(255,255,255,0))]" />
      </section>

      {/* ================= CONTAINER SCROLL SECTION ================= */}
      <section className="relative flex flex-col overflow-hidden bg-primary text-zinc-950 gpu-accelerated">
        <ContainerScroll
          titleComponent={
            <div className="flex items-center justify-center flex-col gpu-accelerated">
              <h1 className="text-2xl sm:text-4xl font-semibold text-white/90 text-center">
                Experience the Future of <br />
                <span className="text-3xl sm:text-4xl md:text-[6rem] font-black mt-2 leading-none text-white tracking-tighter drop-shadow-2xl">
                  Automated Mobility
                </span>
              </h1>
            </div>
          }
        >
          <video
            src="/mobility-demo.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="mx-auto rounded-2xl object-cover h-full w-full gpu-accelerated shadow-2xl"
            draggable={false}
          />
        </ContainerScroll>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          viewport={{ once: true }}
          className="container mx-auto px-6 max-w-4xl text-center pb-20 -mt-10 md:-mt-64 relative z-10"
        >
          <p className="text-base md:text-xl text-white font-bold leading-relaxed drop-shadow-md">
            JEFFBEN Systems is spearheading the digital transformation of urban mobility across Tamil Nadu. Through our proprietary DIGI BUS framework, we deploy advanced automated fare collection and mission-critical fleet intelligence systems. Our mission is to provide transport authorities with robust, data-driven operational control while delivering a premier, frictionless experience for every commuter.
          </p>
        </motion.div>
      </section>

      {/* ================= WHAT WE DO SECTION ================= */}
      <section className="relative py-12 md:py-24 bg-background text-black border-y border-zinc-200 overflow-hidden gpu-accelerated">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight">Strategic Capabilities</h2>
            <p className="text-lg md:text-xl text-neutral-600 mb-12">
              We engineer enterprise-grade transit ecosystems focused on operational excellence:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 text-left">
              {[
                "Real-time fleet scheduling & dispersion",
                "Precision GPS vehicle tracking",
                "QR-integrated seamless boarding",
                "Smart terminal display networks",
                "Unified digital ticketing platforms"
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  whileHover={{ y: -8, scale: 1.02, backgroundColor: "#fff" }}
                  whileTap={{ scale: 0.98 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50 border border-zinc-200 shadow-sm transition-all duration-500 cursor-pointer gpu-accelerated"
                >
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2.5 shrink-0" />
                  <span className="text-neutral-700 font-bold tracking-tight">{item}</span>
                </motion.div>
              ))}
            </div>

            <p className="mt-12 text-lg text-neutral-600">
              Optimizing operational efficiency while elevating the passenger journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= ABOUT US PAGE CONTENT ================= */}
      <section className="relative py-12 md:py-24 bg-primary text-white border-y border-primary/20 overflow-hidden gpu-accelerated">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
            {/* Left Column: All Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              viewport={{ once: true }}
              className="space-y-8 text-left"
            >
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight tracking-tight">Corporate Overview</h2>
                <div className="space-y-6">
                  <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed font-semibold">
                    JEFFBEN Systems is a premier technology enterprise dedicated to the modernization of public infrastructure through industrial-grade automation. We specialize in the development of sophisticated telemetry and real-time information architectures for metropolitan transit.
                  </p>
                  <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed font-semibold">
                    Our unified ecosystem facilitates a seamless interface between regulatory bodies and the public. By harnessing advanced cloud computation, cross-platform mobility applications, and integrated IoT networks, we ensure high-integrity data accessibility across the transit lifecycle.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-8">The JEFFBEN Advantage</h3>
                <div className="grid grid-cols-[1.5fr_1fr] lg:grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8 items-center lg:items-start lg:block xl:grid">
                  <div className="space-y-4 md:space-y-6">
                    {[
                      "Enterprise-grade automation",
                      "High-fidelity real-time data",
                      "User-centric design philosophy",
                      "Scalable state-wide architecture",
                      "Smart City integration ready"
                    ].map((item, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3 md:gap-4 group cursor-default"
                      >
                        <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-white shrink-0 mt-1.5 group-hover:scale-150 transition-transform duration-300" />
                        <span className="text-sm sm:text-base md:text-lg lg:text-xl text-white font-black leading-tight group-hover:translate-x-1 transition-transform duration-300">{item}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mobile-only globe positioned beside the list, scaled down to fit */}
                  <div className="lg:hidden relative h-[140px] sm:h-[300px] w-full flex items-center justify-center translate-x-4">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-[40px] sm:blur-[60px] scale-125" />
                    <Globe className="relative z-10 w-full h-full gpu-accelerated" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Perfect Desktop Globe Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, type: "spring", damping: 20 }}
              className="hidden lg:flex relative aspect-square w-full lg:h-[800px] xl:h-[900px] items-center justify-center gpu-accelerated"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full blur-[150px] xl:blur-[200px] scale-110" />
              <Globe className="relative z-10 w-full h-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= OUR VISION SECTION ================= */}
      <section className="relative py-12 md:py-24 bg-background text-black overflow-hidden gpu-accelerated">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            viewport={{ once: true }}
            className="p-8 sm:p-12 rounded-[48px] bg-sky-50 border border-sky-100 shadow-inner gpu-accelerated"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 tracking-tight text-zinc-950">Our Vision</h2>
            <p className="text-lg sm:text-xl md:text-2xl text-zinc-900 font-medium leading-relaxed italic">
              &quot;To architect a comprehensive digital infrastructure for an intelligent, sustainable, and highly efficient public transit network across Tamil Nadu, establishing a global benchmark for smart urban mobility.&quot;
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= MEET OUR FOUNDER SECTION ================= */}
      <section className="relative py-12 md:py-24 bg-primary text-zinc-950 overflow-hidden gpu-accelerated">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              viewport={{ once: true }}
              className="relative w-full max-w-[380px] mx-auto md:mx-0 group gpu-accelerated"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500 to-orange-400 opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-700" />
              <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden border-8 border-white/20 shadow-2xl shadow-black/20">
                <Image
                  src="/founder.jpg"
                  alt="Founder (JeffBen)"
                  width={576}
                  height={1024}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              viewport={{ once: true }}
              className="gpu-accelerated"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-2 text-white">Executive Leadership</h2>
              <p className="text-xl text-zinc-900 font-black uppercase tracking-widest mb-6 italic opacity-80">JeffBen — Founder & CEO</p>

              <p className="text-lg text-white leading-relaxed mb-6 font-medium">
                A distinguished technologist and entrepreneur focused on addressing complex infrastructure challenges through innovation. With expertise in systems engineering and a strategic vision for urban advancement, JeffBen established JEFFBEN Systems to redefine public accessibility and operational efficiency in modern transit.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-8">
                {[
                  { icon: <Youtube className="w-6 h-6" />, href: "https://youtube.com/@jeffbenofficial?si=46pT3R8BLOVA9AFP", label: "YouTube" },
                  { icon: <Mail className="w-6 h-6" />, href: "mailto:jeffbenofficial1@gmail.com", label: "Email" },
                  { icon: <span className="font-black text-xl px-2">f</span>, href: "https://www.facebook.com/share/1C7WBtFHeS/", label: "Facebook" }
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.15, y: -6, backgroundColor: "#fff", color: "#000" }}
                    whileTap={{ scale: 0.9 }}
                    className="p-4 rounded-2xl text-white transition-all shadow-xl flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-xl gpu-accelerated"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= SERVICES PAGE CONTENT ================= */}
      <section id="solutions" className="relative py-12 md:py-24 bg-background text-black overflow-hidden gpu-accelerated">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-6xl font-bold tracking-tighter">Solutions Portfolio</h2>
            <p className="text-zinc-400 font-bold uppercase tracking-[0.4em] mt-4 text-[10px]">Enterprise Infrastructure Matrix</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {[
              {
                title: "1. Automated Fare Collection System",
                desc: "An end-to-end digital ticketing suite enabling: Seamless mobile & web booking, Instant QR validation, and significant reduction in manual overhead and queue times."
              },
              {
                title: "2. Real-Time Transit Intelligence",
                desc: "Enterprise-grade visibility into network operations featuring high-fidelity arrival predictive modeling, ensuring operational transparency and optimized terminal throughput."
              },
              {
                title: "3. Fleet Telematics & Tracking",
                desc: "Advanced GPS telemetry for real-time asset monitoring, enabling passengers to track journeys and operators to oversee fleet utilization."
              },
              {
                title: "4. QR Smart-Boarding",
                desc: "Vehicle-specific QR integration allowing passengers to instantly scan for: Real-time route status, Schedule adherence, and Frictionless ticket validation."
              }
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: "spring", damping: 20 }}
                whileHover={{ y: -12 }}
                viewport={{ once: true }}
                className="p-8 md:p-10 rounded-[40px] bg-zinc-50 border border-zinc-100 flex flex-col items-start gap-6 transition-all duration-500 shadow-sm hover:shadow-2xl hover:bg-white gpu-accelerated group cursor-pointer"
              >
                <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-black text-xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                  {i + 1}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight leading-none italic uppercase">{service.title.split('. ')[1]}</h3>
                <p className="text-neutral-500 leading-relaxed font-bold text-sm">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TECHNOLOGY OVERVIEW SECTION ================= */}
      <section className="relative py-12 md:py-24 bg-primary text-zinc-950 border-y border-primary/20 overflow-hidden text-center gpu-accelerated">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-6xl font-bold mb-8 text-white tracking-tighter">Next-Gen Infrastructure</h2>
          <p className="text-lg md:text-2xl text-white/90 mb-12 font-bold leading-relaxed">
            JEFFBEN Systems leverages a military-grade technology stack to ensure unmatched reliability, performance, and scalability across large-scale public transit networks:
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {["Web & Mobile Applications", "GPS-based tracking", "Cloud-based data systems", "Secure QR code technology", "Real-time information processing"].map((tech, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.05, y: -4 }}
                className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-black uppercase tracking-widest text-xs shadow-xl gpu-accelerated"
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT US PAGE CONTENT ================= */}
      <section className="flex flex-col items-center justify-center py-20 md:py-40 text-center px-6 bg-background text-black gpu-accelerated">
        <motion.h3 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-3xl md:text-6xl font-black tracking-tighter leading-none italic uppercase"
        >
          Strategic Institutional Partnerships
        </motion.h3>

        <p className="mt-8 max-w-2xl text-neutral-500 text-lg md:text-xl font-bold leading-relaxed">
          We invite transit authorities, municipal government bodies, and state-level fleet operators to initiate high-level collaboration on the future of regional infrastructure.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-6 px-4">
          {[
            { icon: <Youtube className="w-6 h-6" />, href: "https://youtube.com/@jeffbenofficial?si=46pT3R8BLOVA9AFP", label: "YouTube" },
            { icon: <Mail className="w-6 h-6" />, href: "mailto:jeffbenofficial1@gmail.com", label: "Email" },
            { icon: <span className="font-black text-xl px-1">f</span>, href: "https://www.facebook.com/share/1C7WBtFHeS/", label: "Facebook" }
          ].map((social, i) => (
            <motion.a
              key={i}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -4, backgroundColor: "#fff", borderColor: "#EA580C" }}
              whileTap={{ scale: 0.95 }}
              className="p-5 rounded-[28px] bg-zinc-50 border-2 border-zinc-100 text-neutral-900 transition-all shadow-sm flex items-center gap-4 font-black uppercase tracking-tighter italic text-sm md:text-base gpu-accelerated"
              aria-label={social.label}
            >
              <div className="text-orange-600">{social.icon}</div>
              <span>{social.label}</span>
            </motion.a>
          ))}
        </div>

        <p className="mt-16 text-zinc-300 text-[10px] uppercase tracking-[0.6em] font-black italic">Verification Matrix v2.3</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <Link href="/get-ticket" className="px-12 py-6 bg-zinc-900 text-white rounded-[32px] font-black text-lg tracking-tighter hover:bg-orange-600 transition-all active:scale-95 shadow-2xl flex items-center gap-4 group">
            <Ticket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
             Get My Ticket
          </Link>
          <Link href="/conductor" className="px-12 py-6 bg-white border-2 border-zinc-100 text-zinc-900 rounded-[32px] font-black text-lg tracking-tighter hover:border-orange-500 transition-all active:scale-95 shadow-2xl flex items-center gap-4 group">
            <ShieldCheck className="w-6 h-6 text-orange-600 group-hover:scale-110 transition-transform" />
             Conductor Portal
          </Link>
        </div>

        <p className="mt-24 text-4xl md:text-6xl font-black text-orange-600 italic tracking-tighter opacity-10 select-none">
          &quot;Advancing Transit, Enhancing Lives.&quot;
        </p>
      </section>
    </main>
  );
}
