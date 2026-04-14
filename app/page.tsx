"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { 
  Linkedin, Twitter, Github, Mail, Youtube, Facebook, 
  Ticket, ShieldCheck, Lock, X, ChevronRight 
} from "lucide-react";
import dynamic from "next/dynamic";

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
    <main className="relative w-full overflow-x-hidden">
      {/* 6-Digit Neural Access Gate */}
      <AnimatePresence>
        {showPinGate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl border-2 ${error ? "border-rose-500 animate-shake" : "border-zinc-100"}`}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                  <Lock size={24} />
                </div>
                <button onClick={() => setShowPinGate(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
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
                  className="w-full h-20 bg-zinc-900 text-white rounded-[32px] font-black text-xl tracking-tighter hover:bg-orange-500 transition-all flex items-center justify-center gap-3 disabled:opacity-20 active:scale-95"
                >
                  Confirm Identity <ChevronRight size={24} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-2 md:top-5 left-0 z-50 flex items-center gap-0 pointer-events-auto cursor-pointer" onClick={() => setShowPinGate(true)}>
          <Image
            src="/logo2.png"
            alt="JEFFBEN Branding"
            width={500}
            height={200}
            className="h-24 sm:h-28 md:h-36 w-auto object-contain transition-transform hover:scale-105 duration-300 px-4 md:px-8"
            priority
          />
      </div>

      <div className="absolute top-0 right-0 z-50 pointer-events-auto cursor-pointer flex">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div onClick={() => setShowPinGate(true)}>
            <Image
              src="/hero-logo.png"
              alt="JEFFBEN Strategic Emblem"
              width={800}
              height={800}
              className="h-16 sm:h-24 md:h-48 w-auto object-contain mix-blend-multiply drop-shadow-2xl transition-transform hover:scale-105 duration-300 cursor-pointer"
              priority
            />
          </div>
        </motion.div>
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background Bus Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/smart-bus.png"
            alt="Strategic Automated Mobility Infrastructure"
            fill
            className="object-cover md:object-center opacity-90 transition-transform duration-1000"
            priority
          />
          {/* Professional Overlays for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50/80 via-orange-50/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50/20 via-transparent to-orange-50" />
        </div>



        <AuroraBackground className="bg-transparent text-black h-full w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.8,
              ease: "easeInOut",
            }}
            viewport={{ once: true }}
            className="relative z-10 flex flex-col items-center justify-start text-center px-6 md:px-24 pt-12 md:pt-24 w-full h-full"
          >
            <div className="max-w-4xl relative">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-6xl md:text-8xl font-bold bg-gradient-to-b from-black to-zinc-600 bg-clip-text text-transparent tracking-tight leading-tight"
              >
                Welcome to <br className="hidden md:block" />
                <span className="text-black">JEFF</span><span className="text-[#EA580C]">BEN</span> <span className="text-black">Systems</span>
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
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
                  className="rounded-full bg-black px-10 py-4 text-white text-lg font-medium transition-shadow hover:shadow-2xl cursor-pointer"
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
      <section className="relative flex flex-col overflow-hidden bg-primary text-zinc-950">
        <ContainerScroll
          titleComponent={
            <div className="flex items-center justify-center flex-col">
              <h1 className="text-2xl sm:text-4xl font-semibold text-white/90 text-center">
                Experience the Future of <br />
                <span className="text-3xl sm:text-4xl md:text-[6rem] font-black mt-2 leading-none text-white tracking-tighter">
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
            preload="metadata"
            className="mx-auto rounded-2xl object-cover h-full w-full"
            draggable={false}
          />
        </ContainerScroll>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="container mx-auto px-6 max-w-4xl text-center pb-20 -mt-10 md:-mt-64 relative z-10"
        >
          <p className="text-base md:text-xl text-white font-bold leading-relaxed">
            JEFFBEN Systems is spearheading the digital transformation of urban mobility across Tamil Nadu. Through our proprietary DIGI BUS framework, we deploy advanced automated fare collection and mission-critical fleet intelligence systems. Our mission is to provide transport authorities with robust, data-driven operational control while delivering a premier, frictionless experience for every commuter.
          </p>
        </motion.div>
      </section>

      {/* ================= WHAT WE DO SECTION ================= */}
      <section className="relative py-12 md:py-24 bg-background text-black border-y border-zinc-200 overflow-hidden">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-5 rounded-xl bg-gray-50 border border-zinc-200 shadow-sm transition-all duration-300"
                >
                  <span className="text-orange-500 text-xl font-bold">•</span>
                  <span className="text-neutral-700 font-medium">{item}</span>
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
      <section className="relative py-12 md:py-24 bg-primary text-white border-y border-primary/20 overflow-hidden">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center">
            {/* Left Column: All Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
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
                      <div key={i} className="flex items-start gap-3 md:gap-4 group">
                        <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-white shrink-0 mt-1.5 group-hover:scale-125 transition-transform" />
                        <span className="text-sm sm:text-base md:text-lg lg:text-xl text-white font-black leading-tight">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mobile-only globe positioned beside the list, scaled down to fit */}
                  <div className="lg:hidden relative h-[140px] sm:h-[300px] w-full flex items-center justify-center translate-x-4">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-[40px] sm:blur-[60px] scale-125" />
                    <Globe className="relative z-10 w-full h-full" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Perfect Desktop Globe Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="hidden lg:flex relative aspect-square w-full lg:h-[800px] xl:h-[900px] items-center justify-center"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full blur-[150px] xl:blur-[200px] scale-110" />
              <Globe className="relative z-10 w-full h-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= OUR VISION SECTION ================= */}
      <section className="relative py-12 md:py-24 bg-background text-black overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="p-8 sm:p-12 rounded-3xl bg-sky-50 border border-sky-100 shadow-inner"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 tracking-tight text-zinc-950">Our Vision</h2>
            <p className="text-lg sm:text-xl md:text-2xl text-zinc-900 font-medium leading-relaxed">
              To architect a comprehensive digital infrastructure for an intelligent, sustainable, and highly efficient public transit network across Tamil Nadu, establishing a global benchmark for smart urban mobility.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= MEET OUR FOUNDER SECTION ================= */}
      <section className="relative py-12 md:py-24 bg-primary text-zinc-950 overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative w-full max-w-[380px] mx-auto md:mx-0 group"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500 to-orange-400 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-zinc-200 shadow-2xl">
                <Image
                  src="/founder.jpg"
                  alt="Founder (JeffBen)"
                  width={576}
                  height={1024}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-2 text-white">Executive Leadership</h2>
              <p className="text-xl text-zinc-900 font-semibold mb-6">JeffBen — Founder & CEO</p>

              <p className="text-lg text-white leading-relaxed mb-6">
                A distinguished technologist and entrepreneur focused on addressing complex infrastructure challenges through innovation. With expertise in systems engineering and a strategic vision for urban advancement, JeffBen established JEFFBEN Systems to redefine public accessibility and operational efficiency in modern transit.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-8">
                {[
                  { icon: <Youtube className="w-6 h-6" />, href: "https://youtube.com/@jeffbenofficial?si=46pT3R8BLOVA9AFP", label: "YouTube" },
                  { icon: <Mail className="w-6 h-6" />, href: "mailto:jeffbenofficial1@gmail.com", label: "Email" },
                  { icon: <span className="font-bold text-xl px-1">f</span>, href: "https://www.facebook.com/share/1C7WBtFHeS/", label: "Facebook" }
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 rounded-full text-white hover:text-zinc-950 transition-colors shadow-sm flex items-center justify-center bg-white/20 border border-white/60 backdrop-blur-md"
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
      <section id="solutions" className="relative py-12 md:py-24 bg-background text-black overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-6xl font-bold">Solutions Portfolio</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, borderColor: "rgba(255, 107, 0, 0.5)" }}
                viewport={{ once: true }}
                className="p-6 md:p-8 rounded-2xl bg-gray-50 border border-zinc-200 flex flex-col items-start gap-3 md:gap-4 transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 font-bold text-sm md:text-base">
                  {i + 1}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-neutral-900">{service.title.split('. ')[1]}</h3>
                <p className="text-neutral-600 leading-relaxed text-xs md:text-sm">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TECHNOLOGY OVERVIEW SECTION ================= */}
      <section className="relative py-12 md:py-24 bg-primary text-zinc-950 border-y border-primary/20 overflow-hidden text-center">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white">Next-Generation Infrastructure</h2>
          <p className="text-lg md:text-xl text-white/90 mb-12">
            JEFFBEN Systems leverages a military-grade technology stack to ensure unmatched reliability, performance, and scalability across large-scale public transit networks:
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {["Web & Mobile Applications", "GPS-based tracking", "Cloud-based data systems", "Secure QR code technology", "Real-time information processing"].map((tech, i) => (
              <div key={i} className="px-6 py-3 rounded-full bg-white/10  border border-white/20  text-white  font-semibold shadow-sm">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT US PAGE CONTENT ================= */}
      <section className="flex flex-col items-center justify-center py-16 md:py-32 text-center px-6 bg-background text-black">
        <h3 className="text-3xl md:text-5xl font-bold">
          Strategic Institutional Partnerships
        </h3>

        <p className="mt-6 max-w-xl text-neutral-600 text-lg">
          We invite transit authorities, municipal government bodies, and state-level fleet operators to initiate high-level collaboration on the future of regional infrastructure.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-4">
          {[
            { icon: <Youtube className="w-5 h-5" />, href: "https://youtube.com/@jeffbenofficial?si=46pT3R8BLOVA9AFP", label: "YouTube" },
            { icon: <Mail className="w-5 h-5" />, href: "mailto:jeffbenofficial1@gmail.com", label: "Email" },
            { icon: <span className="font-bold">Facebook</span>, href: "https://www.facebook.com/share/1C7WBtFHeS/", label: "Facebook" }
          ].map((social, i) => (
            <motion.a
              key={i}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 sm:p-4 rounded-2xl bg-gray-50 border border-zinc-200 text-neutral-600 hover:text-orange-600 transition-colors shadow-sm flex items-center gap-2 font-medium text-sm sm:text-base"
              aria-label={social.label}
            >
              {social.icon}
              <span>{social.label}</span>
            </motion.a>
          ))}
        </div>

        <p className="mt-8 text-neutral-400 text-sm uppercase tracking-[0.3em] font-black italic">Digital Services & Verification</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link href="/get-ticket" className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all active:scale-95 shadow-lg flex items-center gap-2">
            <Ticket className="w-5 h-5" />
             Get My Ticket
          </Link>
          <Link href="/conductor" className="px-8 py-4 bg-white border border-zinc-200 text-zinc-900 rounded-2xl font-bold hover:bg-zinc-50 transition-all active:scale-95 shadow-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
             Conductor Portal
          </Link>
        </div>

        <p className="mt-16 text-2xl md:text-3xl font-bold text-orange-600">
          &quot;Advancing Transit, Enhancing Lives.&quot;
        </p>
      </section>
    </main>
  );
}
