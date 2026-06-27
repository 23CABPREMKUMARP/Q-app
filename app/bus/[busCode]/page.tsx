"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function BusQRRedirectPage() {
  const { busCode } = useParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded || !busCode) return;

    if (!isSignedIn) {
      // Redirect to the existing sign-in flow and return back here after login
      router.replace(`/sign-in?redirect_url=/bus/${busCode}`);
    } else {
      // If signed in, immediately navigate to the boarding (seat-selection) page
      const tripId = `bus_${busCode.toLowerCase()}`;
      router.replace(`/town-bus/${tripId}/seat-selection`);
    }
  }, [isLoaded, isSignedIn, busCode, router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white font-sans p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="animate-spin text-[#FF9933]" size={40} />
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Establishing boarding link...</p>
          <p className="text-sm font-bold text-orange-500 uppercase tracking-widest">{busCode}</p>
        </div>
      </div>
    </div>
  );
}
