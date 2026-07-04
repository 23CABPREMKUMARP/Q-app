"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2, Bus, QrCode, ShieldCheck, MapPin, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

export default function BusQRRedirectPage() {
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
    // Only proceed with redirects if we are SURE we are in the native app.
    if (isNative === true && isLoaded && busCode) {
      if (!isSignedIn) {
        router.replace(`/sign-in?redirect_url=/bus/${busCode}`);
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

  // APP USER: Return null while redirecting
  if (isNative) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#FF9933]" size={40} />
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-zinc-500">Establishing boarding link...</p>
      </div>
    );
  }

  // BROWSER USER: Show Web Experience
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#FF9933]/10 rounded-full blur-[100px]" />
      
      <header className="w-full max-w-5xl py-6 flex justify-center mb-8 z-10">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/hero-logo.png" alt="JeffBen" width={40} height={40} />
          <div className="h-6 w-px bg-slate-300" />
          <Image src="/hero-logo.png" alt="Digi Bus" width={40} height={40} className="mix-blend-multiply" />
        </Link>
      </header>

      <main className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 flex flex-col items-center text-center z-10 relative">
        <div className="absolute -top-6 bg-gradient-to-tr from-orange-500 to-[#FF9933] text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2">
          <ShieldCheck size={16} />
          Verified Matrix Node
        </div>

        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 mt-4 border-8 border-white shadow-inner">
          <Bus size={40} className="text-slate-400" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Bus Found</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">You have scanned the QR code for:</p>
        
        <div className="mt-4 py-3 px-8 bg-slate-100 rounded-xl border border-slate-200">
          <p className="text-2xl font-black text-[#FF9933] uppercase tracking-widest">{busCode}</p>
        </div>

        <div className="w-full h-px bg-slate-100 my-8" />

        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">How to Board</h2>
        
        <div className="space-y-4 w-full text-left">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <QrCode size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">1. Open the JeffBen App</p>
              <p className="text-xs text-slate-500 mt-1">Don't have it? Download it below.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
              <Ticket size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">2. Tap "Scan QR"</p>
              <p className="text-xs text-slate-500 mt-1">Scan this matrix code using the app.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
              <MapPin size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">3. Select Seat & Pay</p>
              <p className="text-xs text-slate-500 mt-1">Get your digital ticket instantly.</p>
            </div>
          </div>
        </div>

        <button className="mt-10 w-full bg-slate-900 text-white rounded-xl h-14 font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-colors shadow-xl">
          Download App to Board
        </button>

        <div className="mt-6 text-center w-full">
          <p className="text-xs text-slate-500 font-medium mb-2">App not installed?</p>
          <Link href={`/boarding/${busCode}`} className="inline-block text-sm font-black text-[#FF9933] uppercase tracking-widest hover:underline py-2">
            Continue in Web
          </Link>
        </div>

      </main>
      
      <footer className="mt-auto py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        Powered by JeffBen Systems
      </footer>
    </div>
  );
}
