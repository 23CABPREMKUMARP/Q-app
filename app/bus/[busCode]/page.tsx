"use client";

import { useParams, useRouter } from "next/navigation";
import { ShieldCheck, Bus, Grid, QrCode, MapPin } from "lucide-react";
import Link from "next/link";


export default function BusQRRedirectPage() {
  const { busCode } = useParams();
  const codeStr = Array.isArray(busCode) ? busCode[0] : busCode;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">

      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-md relative mt-8">
          
          {/* Top Floating Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-[#FF8A00] text-[#111827] px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-orange-500/20">
              <ShieldCheck size={14} />
              Verified Matrix Node
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-[#ffffff] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] pt-12 pb-8 px-8 border border-zinc-100 flex flex-col items-center text-center">
            
            {/* Bus Icon */}
            <div className="w-16 h-16 bg-[#ffffff] rounded-full flex items-center justify-center mb-6">
              <Bus size={28} className="text-[#6B7280]" />
            </div>

            <h1 className="text-2xl font-black text-[#F28500] tracking-tight mb-2">BUS FOUND</h1>
            <p className="text-[13px] text-slate-500 mb-6">You have scanned the QR code for:</p>
            
            {/* Bus Code Pill */}
            <div className="bg-[#ffffff] px-8 py-3 rounded-xl border border-slate-100 mb-8 w-full max-w-[200px]">
              <span className="text-xl font-black tracking-widest text-[#FF8A00] uppercase">
                {codeStr}
              </span>
            </div>

            <div className="w-full h-px bg-slate-100 mb-8"></div>

            <h2 className="text-[11px] font-bold text-[#F28500] tracking-[0.2em] mb-6">HOW TO BOARD</h2>

            <div className="space-y-6 w-full text-left mb-10">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Grid size={14} className="text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-[#F28500]">1. Open the JeffBen App</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Don't have it? Download it below.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <QrCode size={14} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-[#F28500]">2. Tap "Scan QR"</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Scan this matrix code using the app.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-[#F28500]" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-[#F28500]">3. Select Seat & Pay</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Get your digital ticket instantly.</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <a 
              href="/api/download-app" 
              download="Smart-Tamizha-App.apk"
              className="w-full bg-[#F28500] hover:bg-[#F28500] text-[#111827] font-bold text-[12px] py-4 rounded-xl mb-6 transition-colors tracking-widest shadow-lg shadow-slate-900/10 block"
            >
              DOWNLOAD APP TO BOARD
            </a>

            <div className="space-y-2">
              <p className="text-[11px] text-[#6B7280]">App not installed?</p>
              <Link 
                href={`/town-bus/bus/${codeStr}`}
                className="block text-[12px] font-bold text-[#FF8A00] hover:text-[#e67a00] transition-colors tracking-widest"
              >
                CONTINUE IN WEB
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
