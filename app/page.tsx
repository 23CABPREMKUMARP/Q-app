"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";

import { Globe } from "@/src/registry/magicui/globe";
import { AuroraBackground } from "../src/components/ui/aurora-background";
import { ContainerScroll } from "../src/components/ui/container-scroll-animation";
import { Linkedin, Twitter, Github, Mail, Youtube } from "lucide-react";

export default function ProductPage() {
  return (
    <main className="relative w-full overflow-x-hidden">
      <div className="absolute top-6 md:top-10 left-0 z-50 flex items-center gap-0 pointer-events-auto">
        <Image
          src="/logo2.png"
          alt="JEFFBEN Corporate Branding"
          width={600}
          height={240}
          className="h-24 md:h-48 w-auto object-contain mix-blend-multiply transition-transform hover:scale-105 duration-300"
        />
      </div>

      <div className="absolute top-0 right-0 z-50 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Image
            src="/hero-logo.png"
            alt="JEFFBEN Strategic Emblem"
            width={800}
            height={800}
            className="h-24 md:h-48 w-auto object-contain mix-blend-multiply drop-shadow-2xl"
          />
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
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white" />
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
                JEFF<span className="text-orange-600">BEN</span> Systems
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-6 text-xl sm:text-2xl md:text-4xl font-semibold text-neutral-800 leading-snug"
              >
                Pioneering Intelligence in <br className="hidden md:block" />
                Metropolitan Public Transit Ecosystems
              </motion.h2>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-12 rounded-full bg-black px-10 py-4 text-white text-lg font-medium transition-shadow hover:shadow-2xl cursor-pointer"
              >
                Explore Solutions
              </motion.button>
            </div>
          </motion.div>
        </AuroraBackground>
        <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.1),rgba(255,255,255,0))]" />
      </section>

      {/* ================= CONTAINER SCROLL SECTION ================= */}
      <section className="flex flex-col overflow-hidden bg-background text-black">
        <ContainerScroll
          titleComponent={
            <div className="flex items-center justify-center flex-col">
              <h1 className="text-2xl sm:text-4xl font-semibold text-black  text-center">
                Experience the Future of <br />
                <span className="text-3xl sm:text-4xl md:text-[6rem] font-bold mt-1 leading-none bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
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
            className="mx-auto rounded-2xl object-cover h-full w-full"
            draggable={false}
          />
        </ContainerScroll>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="container mx-auto px-6 max-w-4xl text-center pb-20 -mt-20 md:-mt-64 relative z-10"
        >
          <p className="text-base md:text-xl text-black  font-medium leading-relaxed">
            JEFFBEN Systems is spearheading the digital transformation of urban mobility across Tamil Nadu. Through our proprietary DIGI BUS framework, we deploy advanced automated fare collection and mission-critical fleet intelligence systems. Our mission is to provide transport authorities with robust, data-driven operational control while delivering a premier, frictionless experience for every commuter.
          </p>
        </motion.div>
      </section>

      {/* ================= WHAT WE DO SECTION ================= */}
      <section className="relative py-12 md:py-24 bg-white text-black border-y border-zinc-200 overflow-hidden">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 text-left">
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
                  <span className="text-blue-500 text-xl font-bold">•</span>
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
      <section className="relative py-12 md:py-24 bg-background text-black border-y border-black/5 overflow-hidden">
        <div className="container mx-auto px-6 max-w-screen-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Left Column: All Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8 text-left"
            >
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-black leading-tight tracking-tight">Corporate Overview</h2>
                <div className="space-y-6">
                  <p className="text-lg md:text-xl lg:text-2xl text-neutral-900 leading-relaxed font-medium">
                    JEFFBEN Systems is a premier technology enterprise dedicated to the modernization of public infrastructure through industrial-grade automation. We specialize in the development of sophisticated telemetry and real-time information architectures for metropolitan transit.
                  </p>
                  <p className="text-lg md:text-xl lg:text-2xl text-neutral-900 leading-relaxed">
                    Our unified ecosystem facilitates a seamless interface between regulatory bodies and the public. By harnessing advanced cloud computation, cross-platform mobility applications, and integrated IoT networks, we ensure high-integrity data accessibility across the transit lifecycle.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8">The JEFFBEN Advantage</h3>
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
                        <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-black shrink-0 mt-1.5 group-hover:scale-125 transition-transform" />
                        <span className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-900 font-semibold leading-tight">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mobile-only globe positioned beside the list, scaled down to fit */}
                  <div className="lg:hidden relative h-[140px] sm:h-[300px] w-full flex items-center justify-center translate-x-4">
                    <div className="absolute inset-0 bg-blue-500/15  rounded-full blur-[40px] sm:blur-[60px] scale-125" />
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
              <div className="absolute inset-0 bg-blue-500/10  rounded-full blur-[150px] xl:blur-[200px] scale-110" />
              <Globe className="relative z-10 w-full h-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= OUR VISION SECTION ================= */}
      <section className="relative py-12 md:py-24 bg-white text-black overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 shadow-inner"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 tracking-tight">Our Vision</h2>
            <p className="text-lg sm:text-xl md:text-2xl text-black  font-medium leading-relaxed">
              To architect a comprehensive digital infrastructure for an intelligent, sustainable, and highly efficient public transit network across Tamil Nadu, establishing a global benchmark for smart urban mobility.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= MEET OUR FOUNDER SECTION ================= */}
      <section className="relative py-12 md:py-24 bg-background text-black overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative w-full max-w-[380px] mx-auto md:mx-0 group"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-cyan-500 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
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
              <h2 className="text-3xl md:text-5xl font-bold mb-2">Executive Leadership</h2>
              <p className="text-xl text-blue-600  font-semibold mb-6">JeffBen — Founder & CEO</p>

              <p className="text-lg text-black  leading-relaxed mb-6">
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
                    className="p-3 rounded-full text-black hover:text-blue-500 transition-colors shadow-sm flex items-center justify-center bg-gray-50 border border-zinc-100"
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
      <section id="solutions" className="relative py-12 md:py-24 bg-white text-black overflow-hidden">
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
                title: "4. Smart Terminal Displays",
                desc: "IoT-enabled LED information networks for bus terminals, delivering dynamic route updates and schedule information with high visibility."
              },
              {
                title: "5. QR Smart-Boarding",
                desc: "Vehicle-specific QR integration allowing passengers to instantly scan for: Real-time route status, Schedule adherence, and Frictionless ticket validation."
              }
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, borderColor: "rgba(59, 130, 246, 0.5)" }}
                viewport={{ once: true }}
                className="p-6 md:p-8 rounded-2xl bg-gray-50 border border-zinc-200 flex flex-col items-start gap-3 md:gap-4 transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-sm md:text-base">
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
      <section className="relative py-12 md:py-24 bg-background text-black border-y border-white/10 overflow-hidden text-center">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Next-Generation Infrastructure</h2>
          <p className="text-lg md:text-xl text-black  mb-12">
            JEFFBEN Systems leverages a military-grade technology stack to ensure unmatched reliability, performance, and scalability across large-scale public transit networks:
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {["Web & Mobile Applications", "GPS-based tracking", "Cloud-based data systems", "Secure QR code technology", "Real-time information processing"].map((tech, i) => (
              <div key={i} className="px-6 py-3 rounded-full bg-white  border border-zinc-200  text-black  font-semibold shadow-sm">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT US PAGE CONTENT ================= */}
      <section className="flex flex-col items-center justify-center py-16 md:py-32 text-center px-6 bg-white text-black">
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
              className="p-3 sm:p-4 rounded-2xl bg-gray-50 border border-zinc-200 text-neutral-600 hover:text-blue-500 transition-colors shadow-sm flex items-center gap-2 font-medium text-sm sm:text-base"
              aria-label={social.label}
            >
              {social.icon}
              <span>{social.label}</span>
            </motion.a>
          ))}
        </div>

        <p className="mt-16 text-2xl md:text-3xl font-bold text-blue-600">
          &quot;Advancing Transit, Enhancing Lives.&quot;
        </p>
      </section>
    </main>
  );
}
