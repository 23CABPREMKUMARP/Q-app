import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/about",
  "/privacy",
  "/terms",
  "/scan",
  "/favicon.ico",
  "/manifest.json",
  "/manifest.webmanifest",
  "/logo2.png",
  "/hero-logo.png",
  "/smart-bus.png",
  "/bus-marker-3d.png",
  "/videos/(.*)",
  "/.well-known/(.*)",
  // All town-bus passenger pages
  "/town-bus(.*)",
  "/live-map(.*)",
  "/history(.*)",
  "/get-ticket(.*)",
  "/luggage-booking(.*)",
  "/track/(.*)",
  "/bus/(.*)",
  // Public-facing API routes (read-only data, no auth needed)
  "/api/buses(.*)",
  "/api/town-bus/search(.*)",
  "/api/town-bus/current-trip(.*)",
  "/api/town-bus/active-trip(.*)",
  "/api/buses/search(.*)",
  "/api/luggage/track(.*)",
  "/api/bookings/by-phone(.*)",
  "/api/bookings/validate(.*)",
  "/api/passenger/(.*)",
  "/api/phonepe(.*)",
  "/api/conductor/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
