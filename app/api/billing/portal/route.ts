import { NextResponse } from "next/server";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Billing isn't configured on this server yet" }, { status: 500 });
  }

  const subscription = await prisma.subscription.findUnique({ where: { vendorId: session.vendor.id } });
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account yet — subscribe to a paid plan first" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${appUrl}/dashboard/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
