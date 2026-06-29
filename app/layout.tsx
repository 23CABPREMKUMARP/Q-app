import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AppBootSplash } from "@/src/components/AppBootSplash";

import { Footer } from "@/src/components/Footer";
import { MobileBottomNav } from "@/src/components/MobileBottomNav";
import { WebHeader } from "@/src/components/WebHeader";
import { GlobalLoader } from "@/src/components/GlobalLoader";
import { CapacitorDeepLink } from "@/src/components/CapacitorDeepLink";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: "#FF9933",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "JeffBen Systems | Metropolitan Transit Intelligence",
  description: "Pioneering industrial-grade automation and real-time telemetry for metropolitan public transit ecosystems across Tamil Nadu.",
  keywords: ["Transit Intelligence", "Public Transport Automation", "Jeffben Systems", "Bus Tracking", "Urban Mobility Solutions", "Tamil Nadu Transit"],
  metadataBase: new URL('https://jeffben.org'),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JeffBen",
  },
  openGraph: {
    title: "JeffBen Systems - Future of Automated Mobility",
    description: "Official platform for advanced transit telemetry and smart city infrastructure integration.",
    images: ['/hero-logo.png'],
    type: 'website',
  },
  icons: {
    icon: '/hero-logo.png',
    apple: '/hero-logo.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#FF9933",
          colorBackground: "#ffffff",
          colorText: "#0f172a",
          borderRadius: "1rem",
          fontFamily: "Inter, Manrope, system-ui, sans-serif",
        },
        elements: {
          card: "shadow-none border border-slate-100",
          headerTitle: "font-black tracking-tight uppercase",
          headerSubtitle: "text-slate-400 text-xs",
          formButtonPrimary: "bg-[#FF9933] hover:bg-[#e07b1a] text-white font-black uppercase tracking-widest rounded-xl h-12",
          footerActionLink: "text-[#FF9933] font-bold",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className="selection:bg-orange-500 selection:text-white">
        <head>
          <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
        </head>
        <body
          className={`${inter.variable} ${manrope.variable} antialiased bg-slate-50 min-h-full flex flex-col`}
        >
          <CapacitorDeepLink />
          <WebHeader />
          <main className="flex-1 scroll-smooth">
            <GlobalLoader>
              {children}
            </GlobalLoader>
          </main>
          <MobileBottomNav />
          <div className="hidden md:block">
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
