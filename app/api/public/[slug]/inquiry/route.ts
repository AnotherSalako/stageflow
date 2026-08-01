import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/sanitize";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug } });
  if (!vendor || !vendor.publicProfile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const name = cleanText(body.name, 100);
  const phone = cleanText(body.phone, 30);
  const message = cleanText(body.message, 1000);
  const eventDate = body.eventDate;

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  // Inquiries stay open to anonymous visitors — logged-in consumers additionally
  // get the request linked to their account so it shows up under "My requests".
  const { userId } = await auth();

  const inquiry = await prisma.inquiry.create({
    data: {
      vendorId: vendor.id,
      name,
      phone,
      message: message || null,
      eventDate: eventDate ? new Date(eventDate) : null,
      consumerClerkUserId: userId || null,
    },
  });

  return NextResponse.json({ inquiry }, { status: 201 });
}
