import { authMiddleware } from "@clerk/nextjs/server";
 
// List of public routes that don't require authentication
const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/all-products",
  "/product/(.*)",
  "/api/webhooks/(.*)",
  "/api/inngest"
];
 
export default authMiddleware({
  publicRoutes,
  // Debug option to help troubleshoot (remove in production)
  debug: process.env.NODE_ENV === 'development',
});
 
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$).*)"
  ],
};
