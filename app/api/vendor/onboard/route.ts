import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ServiceCategory } from "@prisma/client";
import { cleanText } from "@/lib/sanitize";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.vendor.findUnique({ where: { clerkUserId: userId } });
  if (existing) return NextResponse.json({ error: "Profile already exists" }, { status: 409 });

  const body = await req.json();
  const businessName = cleanText(body.businessName, 120);
  const category = body.category;
  const serviceArea = cleanText(body.serviceArea, 120);
  const whatsappNumber = cleanText(body.whatsappNumber, 30);
  const phone = cleanText(body.phone, 30) || null;
  const bio = cleanText(body.bio, 1000) || null;
  const servicesOffered = cleanText(body.servicesOffered, 500) || null;
  const pricingNotes = cleanText(body.pricingNotes, 500) || null;

  if (!businessName || !category || !whatsappNumber) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!(Object.values(ServiceCategory) as string[]).includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  const baseSlug = slugify(businessName) || "vendor";
  let slug = baseSlug;
  let i = 1;
  while (await prisma.vendor.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const vendor = await prisma.vendor.create({
    data: {
      clerkUserId: userId,
      email,
      slug,
      businessName,
      category,
      serviceArea,
      whatsappNumber,
      phone,
      bio,
      servicesOffered,
      pricingNotes,
      subscription: { create: { plan: "FREE", status: "ACTIVE" } },
    },
  });

  return NextResponse.json({ vendor }, { status: 201 });
}
