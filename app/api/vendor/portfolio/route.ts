import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVendor } from "@/lib/auth";
import { cleanText, isSafeUrl } from "@/lib/sanitize";
import { getEffectivePlan, getPlanLimits } from "@/lib/entitlements";

export async function POST(req: NextRequest) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const caption = cleanText(body.caption, 200) || null;
  const type = body.type;

  if (!imageUrl || !isSafeUrl(imageUrl)) {
    return NextResponse.json({ error: "A valid http/https URL is required" }, { status: 400 });
  }
  if (type && !["IMAGE", "VIDEO", "LINK"].includes(type)) {
    return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({ where: { vendorId: session.vendor.id } });
  const { portfolioLimit } = getPlanLimits(getEffectivePlan(subscription));

  const count = await prisma.portfolioItem.count({ where: { vendorId: session.vendor.id } });
  if (count >= portfolioLimit) {
    return NextResponse.json(
      { error: `Free plan is limited to ${portfolioLimit} portfolio items — upgrade to Pro for more.` },
      { status: 400 }
    );
  }

  const image = await prisma.portfolioItem.create({
    data: { vendorId: session.vendor.id, imageUrl, caption, type: type || "IMAGE", sortOrder: count },
  });

  return NextResponse.json({ image }, { status: 201 });
}
