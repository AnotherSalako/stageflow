import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/entitlements";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") || undefined;
  const location = req.nextUrl.searchParams.get("location") || undefined;

  const rawVendors = await prisma.vendor.findMany({
    where: {
      publicProfile: true,
      ...(category ? { category: category as any } : {}),
      ...(location ? { serviceArea: { contains: location, mode: "insensitive" } } : {}),
    },
    select: {
      slug: true,
      businessName: true,
      category: true,
      serviceArea: true,
      availability: true,
      coverImageUrl: true,
      portfolio: { where: { type: "IMAGE" }, select: { imageUrl: true }, take: 1, orderBy: { sortOrder: "asc" } },
      subscription: { select: { plan: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const vendors = rawVendors.sort((a, b) => {
    const aPriority = getEffectivePlan(a.subscription) !== "FREE" ? 1 : 0;
    const bPriority = getEffectivePlan(b.subscription) !== "FREE" ? 1 : 0;
    return bPriority - aPriority;
  });

  return NextResponse.json({ vendors });
}
