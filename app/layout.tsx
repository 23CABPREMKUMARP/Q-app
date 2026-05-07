import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { MobileNav } from "@/src/components/MobileNav";
import { MobileHeader } from "@/src/components/MobileHeader";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#000000",
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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="overflow-hidden h-full selection:bg-orange-500 selection:text-white">
        <body
          suppressHydrationWarning
          className={`${openSans.variable} antialiased bg-white h-full flex flex-col overflow-hidden select-none`}
        >
          <MobileHeader />
          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0 scroll-smooth no-scrollbar gpu-accelerated">
            {children}
          </main>
          <MobileNav />
        </body>
      </html>
    </ClerkProvider>
  );
}
