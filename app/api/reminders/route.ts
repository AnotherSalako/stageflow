import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVendor } from "@/lib/auth";
import { cleanText } from "@/lib/sanitize";

export async function GET() {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reminders = await prisma.reminder.findMany({
    where: { booking: { vendorId: session.vendor.id } },
    include: { booking: { include: { client: true } } },
    orderBy: [{ sent: "asc" }, { scheduledFor: "asc" }],
  });

  return NextResponse.json({ reminders });
}

export async function POST(req: NextRequest) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { bookingId, scheduledFor, channel } = body;
  const message = cleanText(body.message, 300);
  if (!bookingId || !message || !scheduledFor) {
    return NextResponse.json({ error: "Booking, message, and date are required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.vendorId !== session.vendor.id) {
    return NextResponse.json({ error: "Invalid booking" }, { status: 400 });
  }

  const reminder = await prisma.reminder.create({
    data: { bookingId, message, scheduledFor: new Date(scheduledFor), channel: channel || "WHATSAPP" },
  });

  return NextResponse.json({ reminder }, { status: 201 });
}
