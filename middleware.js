import { clerkMiddleware } from "@clerk/nextjs/server";

// List of public routes that don't require authentication
const publicPaths = [
  "/",
  "/about",
  "/contact",
  "/all-products",
  "/product/.*",
  "/api/webhooks/.*",
  "/api/inngest"
];

export default clerkMiddleware({
  publicRoutes: publicPaths
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$).*)"
  ],
}; 