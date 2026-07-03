import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/", // Web landing page is fully public
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/api/webhooks(.*)",
  // Allow assets to load
  "/favicon.ico",
  "/manifest.json",
  "/manifest.webmanifest",
  "/logo2.png",
  "/hero-logo.png",
  "/smart-bus.png",
  "/bus-marker-3d.png",
  "/mobility-demo.mp4",
  "/.well-known/(.*)",
  // Allow external callbacks like PhonePe if they exist
  "/api/phonepe(.*)",
  "/api/town-bus(.*)",
  "/api/bookings(.*)",
  "/api/buses(.*)",
  // The bus public info page is public
  "/bus(.*)",
  "/boarding(.*)",
  "/town-bus(.*)",
  "/get-ticket(.*)",
  "/scan(.*)",
  "/history(.*)",
  "/live-map(.*)",
  "/luggage-booking(.*)",
  "/track(.*)"
]);

// APP ONLY Routes
const appOnlyRoutes = createRouteMatcher([
  "/mobile-dashboard(.*)",
  "/conductor(.*)"
]);

// WEB ONLY Routes
const webOnlyRoutes = createRouteMatcher([
  "/about(.*)",
  "/privacy(.*)",
  "/terms(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Check if the request is coming from the installed Capacitor app
  const userAgent = req.headers.get("user-agent") || "";
  const isCapacitorApp = userAgent.includes("JeffBenMobileApp") || userAgent.includes("Capacitor");

  // STRICT SEPARATION ENFORCEMENT
  if (!isCapacitorApp && appOnlyRoutes(req)) {
    // Browser trying to access App route -> redirect to web home
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  if (isCapacitorApp && webOnlyRoutes(req)) {
    // App trying to access Web route -> redirect to mobile dashboard
    return NextResponse.redirect(new URL("/mobile-dashboard", req.url));
  }

  // Enforce authentication for non-public routes OR if the mobile app is requesting its root dashboard
  if (!isPublicRoute(req) || (isCapacitorApp && req.nextUrl.pathname === "/")) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }

  // If it's the mobile app requesting the root domain, silently rewrite to /mobile-dashboard
  if (isCapacitorApp && req.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/mobile-dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
