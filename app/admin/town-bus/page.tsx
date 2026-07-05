"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTownBusRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin?tab=route-fare');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#ffffff] border border-[#E5E7EB] shadow-sm text-[#111827] flex items-center justify-center text-zinc-600 font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-sm font-black uppercase tracking-widest text-zinc-500">Redirecting to operations hub...</p>
      </div>
    </div>
  );
}
