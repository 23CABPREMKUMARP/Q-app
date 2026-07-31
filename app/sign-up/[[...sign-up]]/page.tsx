import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import { GoogleAuthButton } from "@/src/components/GoogleAuthButton";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-5 relative overflow-hidden">
      
      {/* Background decorative glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/8 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-sm space-y-8 relative z-10">

        {/* JeffBen Brand Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className="relative w-12 h-12">
              <Image src="/smart-tamizha-logo.png" alt="Smart Tamizha" fill sizes="48px" className="object-contain" priority />
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="relative w-12 h-12">
              <Image src="/hero-logo.png" alt="Jeff Ben" fill sizes="48px" className="object-contain mix-blend-multiply" priority />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#1A0B00] tracking-tight uppercase">Create Account</h1>
            <p className="text-[#6B7280] text-xs font-semibold uppercase tracking-widest">
              Join the Metropolitan Transit Network
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <GoogleAuthButton mode="signUp" />
          
          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">OR</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          
          {/* Clerk SignUp Component */}
          <SignUp
            appearance={{
              layout: {
                showOptionalFields: false,
              },
              elements: {
                socialButtonsBlockButton: "hidden",
                dividerRow: "hidden",
                card: "shadow-none border-none p-0",
                header: "hidden",
                footer: "hidden"
              }
            }}
          />
        </div>

        {/* Footer note */}
        <p className="text-center text-[10px] text-[#6B7280] font-medium uppercase tracking-widest">
          Secured by Clerk · PhonePe 256-bit encrypted
        </p>
      </div>
    </main>
  );
}
