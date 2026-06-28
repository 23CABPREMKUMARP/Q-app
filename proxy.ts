import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  // Allow assets to load
  "/favicon.ico",
  "/manifest.json",
  "/manifest.webmanifest",
  "/logo2.png",
  "/hero-logo.png",
  "/smart-bus.png",
  "/bus-marker-3d.png",
  "/.well-known/(.*)",
  // Allow external callbacks like PhonePe if they exist
  "/api/phonepe(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
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
