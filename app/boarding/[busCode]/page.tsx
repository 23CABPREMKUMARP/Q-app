"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bus, ShieldCheck, QrCode, Ticket, MapPin, Download, Globe } from "lucide-react";
import Link from "next/link";

export default function BoardingPage() {
  const params = useParams();
  const router = useRouter();
  const busCode = params.busCode as string;
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    // Check if running inside Capacitor (Native App)
    if (typeof window !== "undefined") {
      const isCapacitor = (window as any).Capacitor !== undefined;
      setIsApp(isCapacitor);

      if (isCapacitor) {
        // If in app, automatically route to seat selection if valid bus
        // Or if you want them to click a button, leave this out
        // router.push(`/town-bus/${busCode}/seat-selection`);
      }
    }
  }, [busCode, router]);

  // If in Native App, you might render something else or auto-redirect.
  // We'll just show a simplified version for the native app
  if (isApp) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <Bus size={48} className="text-[#FF9933] mb-4 animate-bounce" />
        <h1 className="text-2xl font-black text-slate-900 uppercase">Connecting...</h1>
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-zinc-500">Establishing boarding link...</p>
      </div>
    );
  }

  // BROWSER USER: Show the beautiful "Bus Found" card
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-12 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#FF9933]/10 rounded-full blur-[100px]" />
      
      {/* Logos at top */}
      <header className="w-full py-8 px-6 flex justify-center z-[100]">
        <Link href="/" className="flex items-center gap-6">
          <img src="/hero-logo.png" alt="JeffBen" style={{ width: 80, height: 80, objectFit: "contain" }} className="mix-blend-multiply" />
          <div className="h-12 w-[1px] bg-black/20" />
          <img src="/logo2.png" alt="Digi Bus" style={{ width: 80, height: 80, objectFit: "contain" }} className="drop-shadow-md" />
        </Link>
      </header>

      <main className="w-full max-w-sm bg-white rounded-t-[48px] rounded-b-[48px] shadow-2xl border border-slate-100 p-8 flex flex-col items-center text-center z-10 relative mt-4">
        {/* Verified Matrix Node Pill */}
        <div className="absolute -top-5 bg-[#FF9933] text-white px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_8px_20px_rgba(255,153,51,0.4)] flex items-center gap-2">
          <ShieldCheck size={16} />
          VERIFIED MATRIX NODE
        </div>

        {/* Bus Icon */}
        <div className="w-20 h-20 bg-[#F8F9FA] rounded-full flex items-center justify-center mt-6 mb-6">
          <Bus size={36} className="text-slate-500" />
        </div>

        <h1 className="text-3xl font-black text-[#0A192F] tracking-tight uppercase mb-2">BUS FOUND</h1>
        <p className="text-slate-500 text-sm font-medium mb-4">You have scanned the QR code for:</p>
        
        {/* Bus Code Pill */}
        <div className="py-2.5 px-8 bg-[#F8F9FA] rounded-full border border-slate-100 mb-8">
          <p className="text-2xl font-black text-[#FF9933] uppercase tracking-widest">{busCode}</p>
        </div>

        <div className="w-full h-px bg-slate-100 mb-8" />

        <h2 className="text-sm font-black text-[#0A192F] tracking-widest uppercase mb-6">HOW TO BOARD</h2>

        <div className="w-full space-y-6 text-left mb-8">
          {/* Step 1 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <QrCode size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#0A192F]">1. Open the JeffBen App</p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Don't have it? Download it below.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF9933] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Ticket size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#0A192F]">2. Tap "Scan QR"</p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Scan this matrix code using the app.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#0A192F]">3. Select Seat & Pay</p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Get your digital ticket instantly.</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Action Buttons at the bottom */}
      <div className="w-full max-w-sm mt-8 px-6 space-y-3 z-10">
        <a 
          href="/digibus-debug.apk" // Replace with actual download link if needed
          className="w-full bg-[#0A192F] text-white rounded-full h-14 font-black uppercase tracking-widest text-xs hover:bg-[#112240] transition-colors shadow-[0_8px_20px_rgba(10,25,47,0.3)] flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Download App
        </a>
        
        <Link 
          href={`/town-bus/${busCode}/seat-selection`}
          className="w-full bg-white text-[#0A192F] border border-slate-200 rounded-full h-14 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Globe size={18} />
          Continue in Web
        </Link>
      </div>
    </div>
  );
}
