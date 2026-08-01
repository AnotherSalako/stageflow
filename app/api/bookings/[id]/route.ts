import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVendor } from "@/lib/auth";
import { cleanText } from "@/lib/sanitize";

async function getOwnedBooking(vendorId: string, id: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.vendorId !== vendorId) return null;
  return booking;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { client: true, payments: { orderBy: { paidAt: "desc" } } },
  });
  if (!booking || booking.vendorId !== session.vendor.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getOwnedBooking(session.vendor.id, params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { eventDate, totalFee, status } = body;

  const booking = await prisma.booking.update({
    where: { id: params.id },
    data: {
      ...(body.eventName !== undefined && { eventName: cleanText(body.eventName, 120) }),
      ...(eventDate !== undefined && { eventDate: new Date(eventDate) }),
      ...(body.eventTime !== undefined && { eventTime: cleanText(body.eventTime, 30) || null }),
      ...(body.venue !== undefined && { venue: cleanText(body.venue, 200) || null }),
      ...(body.city !== undefined && { city: cleanText(body.city, 120) || null }),
      ...(totalFee !== undefined && { totalFee: Number(totalFee) }),
      ...(status !== undefined && { status }),
      ...(body.notes !== undefined && { notes: cleanText(body.notes, 1000) || null }),
    },
  });

  return NextResponse.json({ booking });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getOwnedBooking(session.vendor.id, params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.booking.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
