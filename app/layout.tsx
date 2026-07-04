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
  themeColor: "#A4E5E0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Smart Tamizha by JeffBen Systems | Metropolitan Transit Intelligence",
  description: "Smart Tamizha is the pioneering industrial-grade automation and real-time telemetry platform for metropolitan public transit ecosystems across Tamil Nadu, developed by JeffBen Systems.",
  keywords: ["Smart Tamizha", "JeffBen", "JeffBen Systems", "Transit Intelligence", "Public Transport Automation", "Bus Tracking", "Urban Mobility Solutions", "Tamil Nadu Transit"],
  metadataBase: new URL('https://jeffben.org'),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Smart Tamizha",
  },
  openGraph: {
    title: "Smart Tamizha by JeffBen Systems - Future of Automated Mobility",
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
          colorPrimary: "#A4E5E0",
          colorBackground: "#ffffff",
          colorText: "#0f172a",
          borderRadius: "1rem",
          fontFamily: "Inter, Manrope, system-ui, sans-serif",
        },
        elements: {
          card: "shadow-none border border-slate-100",
          headerTitle: "font-black tracking-tight uppercase",
          headerSubtitle: "text-slate-400 text-xs",
          formButtonPrimary: "bg-[#A4E5E0] hover:bg-[#8bd9d3] text-slate-900 font-black uppercase tracking-widest rounded-xl h-12",
          footerActionLink: "text-[#A4E5E0] font-bold",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className="selection:bg-orange-500 selection:text-white">
        <head>
          <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Smart Tamizha",
                "alternateName": "JeffBen Systems",
                "url": "https://jeffben.org",
                "logo": "https://jeffben.org/hero-logo.png",
                "description": "Smart Tamizha is the pioneering industrial-grade automation and real-time telemetry platform for metropolitan public transit ecosystems across Tamil Nadu, developed by JeffBen Systems.",
                "sameAs": [
                  "https://jeffben.org"
                ]
              })
            }}
          />
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
