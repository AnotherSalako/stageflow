import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    include: { portfolio: { orderBy: { sortOrder: "asc" } } },
  });

  if (!vendor || !vendor.publicProfile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    vendor: {
      businessName: vendor.businessName,
      category: vendor.category,
      bio: vendor.bio,
      servicesOffered: vendor.servicesOffered,
      pricingNotes: vendor.pricingNotes,
      serviceArea: vendor.serviceArea,
      whatsappNumber: vendor.whatsappNumber,
      availability: vendor.availability,
      slug: vendor.slug,
      portfolio: vendor.portfolio,
    },
  });
}
