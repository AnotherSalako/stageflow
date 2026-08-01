import { NextRequest, NextResponse } from "next/server";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, STRIPE_PRICE_IDS, PlanInterval } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Billing isn't configured on this server yet" }, { status: 500 });
  }

  const { plan, interval } = (await req.json()) as { plan?: "PRO" | "TEAM"; interval?: PlanInterval };
  if (plan !== "PRO" && plan !== "TEAM") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  if (interval !== "month" && interval !== "year") {
    return NextResponse.json({ error: "Invalid billing interval" }, { status: 400 });
  }

  const priceId = STRIPE_PRICE_IDS[plan][interval];
  if (!priceId) {
    return NextResponse.json({ error: `No Stripe price configured for ${plan}/${interval}` }, { status: 500 });
  }

  const subscription = await prisma.subscription.findUnique({ where: { vendorId: session.vendor.id } });

  let stripeCustomerId = subscription?.stripeCustomerId ?? null;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: session.vendor.email ?? undefined,
      name: session.vendor.businessName,
      metadata: { vendorId: session.vendor.id },
    });
    stripeCustomerId = customer.id;
    await prisma.subscription.upsert({
      where: { vendorId: session.vendor.id },
      update: { stripeCustomerId },
      create: { vendorId: session.vendor.id, stripeCustomerId, plan: "FREE", status: "ACTIVE" },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${appUrl}/dashboard/billing?checkout=canceled`,
    client_reference_id: session.vendor.id,
    metadata: { vendorId: session.vendor.id, plan },
    subscription_data: { metadata: { vendorId: session.vendor.id, plan } },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
