"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BusQRRedirectPage() {
  const { busCode } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (busCode) {
      const codeStr = Array.isArray(busCode) ? busCode[0] : busCode;
      router.replace(`/town-bus/bus/${codeStr}`);
    }
  }, [busCode, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
      <Loader2 className="animate-spin text-[#FF9933]" size={40} />
      <p className="mt-4 text-xs font-black uppercase tracking-widest text-zinc-500">Connecting to bus...</p>
    </div>
  );
}
