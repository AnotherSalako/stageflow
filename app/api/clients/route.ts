import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVendor } from "@/lib/auth";
import { cleanText } from "@/lib/sanitize";

export async function GET() {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { vendorId: session.vendor.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const name = cleanText(body.name, 120);
  const phone = cleanText(body.phone, 30);
  const whatsappNumber = cleanText(body.whatsappNumber, 30) || null;
  const notes = cleanText(body.notes, 1000) || null;
  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: { vendorId: session.vendor.id, name, phone, whatsappNumber, notes },
  });

  return NextResponse.json({ client }, { status: 201 });
}
