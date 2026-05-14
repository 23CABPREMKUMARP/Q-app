import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";

import { Navbar } from "@/src/components/Navbar";
import { Footer } from "@/src/components/Footer";
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
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "JeffBen Systems | Metropolitan Transit Intelligence",
  description: "Pioneering industrial-grade automation and real-time telemetry for metropolitan public transit ecosystems across Tamil Nadu.",
  keywords: ["Transit Intelligence", "Public Transport Automation", "Jeffben Systems", "Bus Tracking", "Urban Mobility Solutions", "Tamil Nadu Transit"],
  metadataBase: new URL('https://jeffben.org'),
  manifest: "/manifest.webmanifest",
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
    icon: '/logo2.png',
    apple: '/logo2.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className="selection:bg-orange-500 selection:text-white">
      <body
        className={`${inter.variable} ${manrope.variable} antialiased bg-white min-h-full flex flex-col`}
      >
        <Navbar />
        <main className="flex-1 scroll-smooth">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
