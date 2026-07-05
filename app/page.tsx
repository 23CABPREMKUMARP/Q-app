"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { 
  Mail, Youtube, Facebook, 
  Ticket, ShieldCheck, ChevronRight 
} from "lucide-react";
import dynamic from "next/dynamic";

const Globe = dynamic(() => import("@/src/registry/magicui/globe").then(m => m.Globe), { ssr: false });

const ContainerScroll = dynamic(() => import("../src/components/ui/container-scroll-animation").then(m => m.ContainerScroll), { ssr: false });

const HomeLoader = React.memo(({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[1000] bg-[#F28500] flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-12"
      >
        <div className="flex items-center gap-8">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1, type: "spring" }}
            className="relative w-32 h-32 md:w-48 md:h-48"
          >
            <Image src="/logo2.png" alt="Digi Bus" fill sizes="200px" className="object-contain" priority />
          </motion.div>
          <motion.div 
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="w-px h-24 bg-zinc-950/20" 
          />
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1, type: "spring" }}
            className="relative w-32 h-32 md:w-48 md:h-48"
          >
            <Image src="/hero-logo.png" alt="Jeff Ben" fill sizes="200px" className="object-contain mix-blend-multiply" priority />
          </motion.div>
        </div>

        <div className="space-y-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic font-heading"
          >
            <span className="text-zinc-950">Digi Bus</span> <span className="text-[#111827]">Stand</span>
          </motion.h2>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1.8, duration: 3.5, ease: "linear" }}
            className="h-1.5 bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] rounded-full mx-auto"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 2.2 }}
            className="text-zinc-950 font-bold uppercase tracking-widest text-[10px]"
          >
            Powered By JeffBen Systems
          </motion.p>
        </div>

        <motion.div 
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-[2px] bg-zinc-950/5 pointer-events-none"
        />
      </motion.div>
    </motion.div>
  );
});

HomeLoader.displayName = "HomeLoader";

export default function ProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    // Bulletproof video playback for mobile browsers
    if (!isLoading && videoRef.current) {
      videoRef.current.play().catch((e) => {
        console.warn("Video autoplay prevented:", e);
      });
    }
  }, [isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);


  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <HomeLoader key="loader" onComplete={() => setIsLoading(false)} />
      ) : (
        <motion.main 
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{ willChange: "opacity" }}
          className="relative w-full overflow-x-hidden"
        >

      {/* ================= HERO SECTION ================= */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center gpu-accelerated">
        {/* Background Bus Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bus.jpg"
            alt="Strategic Automated Mobility Infrastructure"
            fill
            sizes="100vw"
            className="object-cover md:object-center opacity-90 gpu-accelerated"
            priority
          />
          {/* Professional Overlays for Legibility - Replaced blur with standard gradient for performance */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50/90 via-orange-50/60 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50/20 via-transparent to-orange-50 pointer-events-none" />
        </div>

        <div className="bg-transparent text-[#111827] h-full w-full gpu-accelerated relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 1,
              ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for premium feel
            }}
            viewport={{ once: true }}
            className="relative z-10 flex flex-col items-center justify-center text-center px-6 md:px-24 pt-8 md:pt-12 w-full h-full"
          >
            <div className="max-w-4xl relative">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/5 border border-zinc-900/10 text-xs font-bold uppercase tracking-widest text-zinc-600"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Powered By JeffBen Systems
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                viewport={{ once: true }}
                className="text-4xl sm:text-6xl md:text-8xl font-bold bg-gradient-to-b from-black to-zinc-600 bg-clip-text text-transparent tracking-tight leading-tight"
              >
                Welcome to <br className="hidden md:block" />
                Digi <span className="text-[#EA580C]">Bus</span> Stand
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 1 }}
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
                  aria-label="Explore Solutions"
                  onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] px-10 py-4 text-[#111827] text-lg font-medium transition-all hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:bg-[#10B981] hover:text-[#FFFFFF] hover:border-[#10B981] cursor-pointer gpu-accelerated"
                >
                  Explore Solutions
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.1),rgba(255,255,255,0))]" />
      </section>

      {/* ================= CONTAINER SCROLL SECTION ================= */}
      <section className="relative flex flex-col overflow-hidden bg-primary text-zinc-950 gpu-accelerated">
        <ContainerScroll
          titleComponent={
            <div className="flex items-center justify-center flex-col gpu-accelerated">
              <h2 className="text-2xl sm:text-4xl font-semibold text-[#111827]/90 text-center">
                Experience the Future of <br />
                <span className="text-3xl sm:text-4xl md:text-[6rem] font-bold mt-2 leading-none text-[#111827] tracking-tight font-heading">
                  Automated Mobility
                </span>
              </h2>
            </div>
          }
        >
          <div 
            className="mx-auto rounded-2xl object-cover h-full w-full shadow-2xl bg-[#F8FAFC] border border-[#E5E7EB] shadow-sm text-[#111827] overflow-hidden relative"
          >
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              preload="auto"
              style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
            >
              <source src="/mobility-demo.mp4" type="video/mp4" />
            </video>
          </div>
        </ContainerScroll>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          viewport={{ once: true }}
          className="container mx-auto px-6 max-w-4xl text-center pb-20 -mt-10 md:-mt-64 relative z-10"
        >
          <p className="text-base md:text-xl text-[#111827] font-medium leading-relaxed">
            JEFFBEN Systems is spearheading the digital transformation of urban mobility across Tamil Nadu. Through our proprietary Digi Bus Stand framework, we deploy advanced automated fare collection and mission-critical fleet intelligence systems. Our mission is to provide transport authorities with robust, data-driven operational control while delivering a premier, frictionless experience for every commuter.
          </p>
        </motion.div>
      </section>

      {/* ================= WHAT WE DO SECTION ================= */}
      <section className="relative py-12 md:py-24 bg-background text-[#111827] border-y border-zinc-200 overflow-hidden gpu-accelerated">
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
                  <span className="text-neutral-700 font-medium tracking-tight">{item}</span>
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
      <section className="relative py-12 md:py-24 bg-primary text-[#111827] border-y border-primary/20 overflow-hidden gpu-accelerated">
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
                <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-[#111827] leading-tight tracking-tight">Corporate Overview</h2>
                <div className="space-y-6">
                  <p className="text-lg md:text-xl lg:text-2xl text-[#111827] leading-relaxed font-medium">
                    JEFFBEN Systems is a premier technology enterprise dedicated to the modernization of public infrastructure through industrial-grade automation. We specialize in the development of sophisticated telemetry and real-time information architectures for metropolitan transit.
                  </p>
                  <p className="text-lg md:text-xl lg:text-2xl text-[#111827]/90 leading-relaxed font-medium">
                    Our unified ecosystem facilitates a seamless interface between regulatory bodies and the public. By harnessing advanced cloud computation, cross-platform mobility applications, and integrated IoT networks, we ensure high-integrity data accessibility across the transit lifecycle.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 font-heading">The JEFFBEN Advantage</h3>
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
                        <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-[#F8FAFC] shrink-0 mt-1.5 group-hover:scale-150 transition-transform duration-300" />
                        <span className="text-sm sm:text-base md:text-lg lg:text-xl text-[#111827] font-medium leading-tight group-hover:translate-x-1 transition-transform duration-300">{item}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mobile-only globe positioned beside the list, scaled down to fit */}
                  <div className="lg:hidden relative h-[140px] sm:h-[300px] w-full flex items-center justify-center translate-x-4">
                    <div className="absolute inset-0 bg-[#F8FAFC]/20 rounded-full blur-[40px] sm:blur-[60px] scale-125" />
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
              <div className="absolute inset-0 bg-[#F8FAFC]/20 rounded-full blur-[150px] xl:blur-[200px] scale-110" />
              <Globe className="relative z-10 w-full h-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= OUR VISION SECTION ================= */}
      <section className="relative py-12 md:py-24 bg-background text-[#111827] overflow-hidden gpu-accelerated">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            viewport={{ once: true }}
            className="p-8 sm:p-12 rounded-[48px] bg-sky-50 border border-sky-100 shadow-inner gpu-accelerated"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 tracking-tight text-zinc-950">Our Vision</h2>
            <p className="text-lg sm:text-xl md:text-2xl text-zinc-900 font-normal leading-relaxed">
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
              <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden border-8 border-[#E5E7EB] shadow-2xl shadow-black/20">
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
              <h2 className="text-3xl md:text-5xl font-bold mb-2 text-[#111827]">Executive Leadership</h2>
              <p className="text-xl text-zinc-900 font-medium uppercase tracking-wider mb-6 opacity-80">JeffBen — Founder & CEO</p>

              <p className="text-lg text-[#111827] leading-relaxed mb-6 font-medium">
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
                    className="p-4 rounded-2xl text-[#111827] transition-all shadow-xl flex items-center justify-center bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] border border-[#E5E7EB] backdrop-blur-xl gpu-accelerated"
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
      <section id="solutions" className="relative py-12 md:py-24 bg-background text-[#111827] overflow-hidden gpu-accelerated">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-6xl font-bold tracking-tight">Solutions Portfolio</h2>
            <p className="text-zinc-600 font-medium uppercase tracking-[0.2em] mt-4 text-[11px]">Enterprise Infrastructure Matrix</p>
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
                className="p-8 md:p-10 rounded-[40px] bg-zinc-50 border border-zinc-100 flex flex-col items-start gap-6 transition-all duration-500 shadow-sm hover:shadow-2xl hover:bg-[#F8FAFC] gpu-accelerated group cursor-pointer"
              >
                <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-semibold text-xl group-hover:bg-[#10B981] group-hover:text-[#ffffff] transition-all duration-500">
                  {i + 1}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight leading-none uppercase">{service.title.split('. ')[1]}</h3>
                <p className="text-neutral-500 leading-relaxed font-normal text-sm">
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
          <h2 className="text-3xl md:text-6xl font-bold mb-8 text-[#111827] tracking-tighter">Next-Gen Infrastructure</h2>
          <p className="text-lg md:text-2xl text-[#111827]/90 mb-12 font-bold leading-relaxed">
            JEFFBEN Systems leverages a military-grade technology stack to ensure unmatched reliability, performance, and scalability across large-scale public transit networks:
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {["Web & Mobile Applications", "GPS-based tracking", "Cloud-based data systems", "Secure QR code technology", "Real-time information processing"].map((tech, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.05, y: -4 }}
                className="px-8 py-4 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] backdrop-blur-md border border-[#E5E7EB] text-[#111827] font-medium uppercase tracking-wider text-xs shadow-xl gpu-accelerated"
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT US PAGE CONTENT ================= */}
      <section className="flex flex-col items-center justify-center py-20 md:py-40 text-center px-6 bg-background text-[#111827] gpu-accelerated">
        <motion.h3 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-3xl md:text-6xl font-bold tracking-tight leading-none uppercase"
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
            { icon: <span className="font-semibold text-xl px-1">f</span>, href: "https://www.facebook.com/share/1C7WBtFHeS/", label: "Facebook" }
          ].map((social, i) => (
            <motion.a
              key={i}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -4, backgroundColor: "#fff", borderColor: "#EA580C" }}
              whileTap={{ scale: 0.95 }}
              className="p-5 rounded-[28px] bg-zinc-50 border-2 border-zinc-100 text-neutral-900 transition-all shadow-sm flex items-center gap-4 font-semibold uppercase tracking-tight text-sm md:text-base gpu-accelerated"
              aria-label={social.label}
            >
              <div className="text-orange-600">{social.icon}</div>
              <span>{social.label}</span>
            </motion.a>
          ))}
        </div>



        <p className="mt-24 text-4xl md:text-6xl font-bold text-[#111827] tracking-tight select-none">
          &quot;Advancing Transit, Enhancing Lives.&quot;
        </p>
      </section>
      </motion.main>
      )}
    </AnimatePresence>
  );
}
