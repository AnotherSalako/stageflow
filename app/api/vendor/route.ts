import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVendor } from "@/lib/auth";
import { ServiceCategory, AvailabilityStatus } from "@prisma/client";
import { cleanText, isSafeUrl } from "@/lib/sanitize";

export async function GET() {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.vendor.id },
    include: { portfolio: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ vendor });
}

// Validates an optional URL field: undefined = not provided (skip), "" = clear it,
// a non-empty string must be a safe http/https URL or the request is rejected.
function readOptionalUrl(value: unknown): { ok: true; value: string | null } | { ok: false } {
  if (value === undefined) return { ok: true, value: undefined as unknown as string | null };
  if (value === null || value === "") return { ok: true, value: null };
  if (typeof value !== "string" || !isSafeUrl(value)) return { ok: false };
  return { ok: true, value: value.trim() };
}

export async function PUT(req: NextRequest) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    businessName,
    category,
    bio,
    servicesOffered,
    pricingNotes,
    serviceArea,
    phone,
    whatsappNumber,
    availability,
    publicProfile,
    slug,
  } = body;

  if (category && !(Object.values(ServiceCategory) as string[]).includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (availability && !(Object.values(AvailabilityStatus) as string[]).includes(availability)) {
    return NextResponse.json({ error: "Invalid availability" }, { status: 400 });
  }

  const urlFields = ["avatarUrl", "coverImageUrl", "instagramUrl", "tiktokUrl", "youtubeUrl"] as const;
  const cleanedUrls: Record<string, string | null> = {};
  for (const field of urlFields) {
    const result = readOptionalUrl(body[field]);
    if (!result.ok) return NextResponse.json({ error: `${field} must be a valid http/https link` }, { status: 400 });
    if (result.value !== undefined) cleanedUrls[field] = result.value;
  }

  let cleanSlug: string | undefined;
  if (slug && slug !== session.vendor.slug) {
    cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = await prisma.vendor.findUnique({ where: { slug: cleanSlug } });
    if (existing) return NextResponse.json({ error: "That link is already taken" }, { status: 409 });
  }

  const vendor = await prisma.vendor.update({
    where: { id: session.vendor.id },
    data: {
      ...(businessName !== undefined && { businessName: cleanText(businessName, 120) }),
      ...(category !== undefined && { category }),
      ...(bio !== undefined && { bio: cleanText(bio, 1000) || null }),
      ...(servicesOffered !== undefined && { servicesOffered: cleanText(servicesOffered, 500) || null }),
      ...(pricingNotes !== undefined && { pricingNotes: cleanText(pricingNotes, 500) || null }),
      ...(serviceArea !== undefined && { serviceArea: cleanText(serviceArea, 120) }),
      ...(phone !== undefined && { phone: cleanText(phone, 30) || null }),
      ...(whatsappNumber !== undefined && { whatsappNumber: cleanText(whatsappNumber, 30) }),
      ...(availability !== undefined && { availability }),
      ...(publicProfile !== undefined && { publicProfile }),
      ...(cleanSlug !== undefined && { slug: cleanSlug }),
      ...cleanedUrls,
    },
  });

  return NextResponse.json({ vendor });
}
