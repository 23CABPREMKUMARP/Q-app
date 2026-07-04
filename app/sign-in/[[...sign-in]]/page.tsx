import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-5 relative overflow-hidden">
      
      {/* Background decorative glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/8 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-sm space-y-8 relative z-10">

        {/* JeffBen Brand Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="relative w-12 h-12">
              <Image src="/logo2.png" alt="Digi Bus" fill sizes="48px" className="object-contain" priority />
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="relative w-12 h-12">
              <Image src="/hero-logo.png" alt="Jeff Ben" fill sizes="48px" className="object-contain mix-blend-multiply" priority />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Welcome Back</h1>
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest">
              Metropolitan Transit Intelligence Platform
            </p>
          </div>
        </div>

        {/* Clerk SignIn Component */}
        <SignIn
          appearance={{
            layout: {
              showOptionalFields: false,
            },
          }}
        />

        {/* Footer note */}
        <p className="text-center text-[10px] text-slate-700 font-medium uppercase tracking-widest">
          Secured by Clerk · PhonePe 256-bit encrypted
        </p>
      </div>
    </main>
  );
}
