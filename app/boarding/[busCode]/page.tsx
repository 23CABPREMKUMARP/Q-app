"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2, Bus, QrCode, ShieldCheck, MapPin, Ticket, Route, CreditCard, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BoardingPage() {
  const { busCode } = useParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [isNative, setIsNative] = useState<boolean | null>(null);

  useEffect(() => {
    import("@capacitor/core")
      .then(({ Capacitor }) => {
        setIsNative(Capacitor.isNativePlatform());
      })
      .catch(() => setIsNative(false));
  }, []);

  useEffect(() => {
    // IF APP IS INSTALLED -> Open App Boarding Screen
    if (isNative === true && isLoaded && busCode) {
      if (!isSignedIn) {
        router.replace(`/sign-in?redirect_url=/boarding/${busCode}`);
      } else {
        const codeStr = Array.isArray(busCode) ? busCode[0] : busCode;
        const tripId = `bus_${codeStr.toLowerCase()}`;
        router.replace(`/town-bus/${tripId}/seat-selection`);
      }
    }
  }, [isNative, isLoaded, isSignedIn, busCode, router]);

  if (isNative === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#FF9933]" size={40} />
      </div>
    );
  }

  // APP USER: Return loading while redirecting to native screen
  if (isNative) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#FF9933]" size={40} />
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-zinc-500">Establishing boarding link...</p>
      </div>
    );
  }

  // BROWSER USER: IF APP NOT INSTALLED -> Open Website Automatically
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-12 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#FF9933]/10 rounded-full blur-[100px]" />
      
      <header className="w-full py-4 px-6 flex justify-center mb-8 z-[100] sticky top-0 bg-[#FF9933]/90 backdrop-blur-xl shadow-md border-b border-[#FF9933]/30">
        <Link href="/" className="flex items-center gap-6">
          <Image src="/logo2.png" alt="Digi Bus" width={80} height={80} className="drop-shadow-md" />
          <div className="h-12 w-[2px] bg-black/20" />
          <Image src="/hero-logo.png" alt="JeffBen" width={80} height={80} className="mix-blend-multiply" />
        </Link>
      </header>

      <main className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 flex flex-col items-center text-center z-10 relative">
        <div className="absolute -top-6 bg-gradient-to-tr from-orange-500 to-[#FF9933] text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2">
          <ShieldCheck size={16} />
          Verified JeffBen Node
        </div>

        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 mt-4 border-8 border-white shadow-inner">
          <Bus size={32} className="text-slate-400" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Ready to Board</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">You scanned boarding code:</p>
        
        <div className="mt-3 py-3 px-8 bg-slate-100 rounded-xl border border-slate-200">
          <p className="text-2xl font-black text-[#FF9933] uppercase tracking-widest">{busCode}</p>
        </div>

        <div className="w-full mt-6 space-y-3 text-left">
          {/* Route Details */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Route size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route Information</p>
              <p className="text-sm font-bold text-slate-900">Coimbatore Metro Network</p>
            </div>
          </div>

          {/* Fare Information */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
              <CreditCard size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fare System</p>
              <p className="text-sm font-bold text-slate-900">Digital Ticketing Active</p>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-slate-100 my-6" />

        <div className="w-full flex flex-col gap-3">
          <a href="#" onClick={(e) => e.preventDefault()} className="w-full bg-[#FF9933] text-white rounded-xl h-14 font-black uppercase tracking-widest text-sm hover:bg-[#e07b1a] transition-colors shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2">
            <Ticket size={18} />
            Book Ticket
            <ChevronRight size={16} className="opacity-50" />
          </a>
          
          <a href="#" onClick={(e) => e.preventDefault()} className="w-full bg-slate-900 text-white rounded-xl h-14 font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-colors shadow-xl flex items-center justify-center gap-2">
            Install JeffBen App
          </a>
        </div>
      </main>
      
      <footer className="mt-auto py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        Metropolitan Transit Intelligence
      </footer>
    </div>
  );
}
