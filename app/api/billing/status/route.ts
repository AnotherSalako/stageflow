import { NextResponse } from "next/server";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan, getPlanLimits } from "@/lib/entitlements";

export async function GET() {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await prisma.subscription.findUnique({ where: { vendorId: session.vendor.id } });
  const effectivePlan = getEffectivePlan(subscription);

  return NextResponse.json({
    plan: effectivePlan,
    status: subscription?.status ?? "ACTIVE",
    currentPeriodEnd: subscription?.currentPeriodEnd,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    hasBillingAccount: Boolean(subscription?.stripeCustomerId),
    limits: getPlanLimits(effectivePlan),
  });
}
