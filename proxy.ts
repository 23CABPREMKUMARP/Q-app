import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/manifest.webmanifest',
  '/logo2.png',
  '/hero-logo.png',
  '/favicon.ico',
  '/api/buses(.*)', // Optional: make some APIs public if needed for the app
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files (those with a dot in the path)
    '/((?!.*\\..*|_next).*)',
    '/',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
