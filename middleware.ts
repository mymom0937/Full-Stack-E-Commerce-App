import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  // Set session options
  sessionOptions: {
    // Session will be considered active for 1 hour without any activity
    maxAge: 3600, // 1 hour in seconds
  },
  // Ensure clerk properly cleans up on logout
  afterAuth(auth, req) {
    if (!auth.isPublicRoute && !auth.userId) {
      // Clear any existing cookies when the user is not authenticated
      auth.sessionClaims = {};
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
