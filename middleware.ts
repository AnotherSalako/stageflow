import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/choose-role(.*)",
  "/home(.*)",
  "/api/vendor(.*)",
  "/api/clients(.*)",
  "/api/bookings(.*)",
  "/api/reminders(.*)",
  "/api/account(.*)",
  "/api/billing/checkout",
  "/api/billing/portal",
  "/api/billing/status",
  // Deliberately NOT /api/billing/webhook — Stripe calls that directly with no
  // Clerk session; it authenticates itself via signature verification instead.
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
