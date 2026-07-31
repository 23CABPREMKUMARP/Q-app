import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  // This component will automatically handle the OAuth redirect back to the app
  // and finalize the sign-in/sign-up process.
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#FF6D00] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#6B7280] text-sm font-semibold uppercase tracking-widest animate-pulse">
          Authenticating...
        </p>
      </div>
      <AuthenticateWithRedirectCallback signUpForceRedirectUrl="/" signInForceRedirectUrl="/" />
    </div>
  );
}
