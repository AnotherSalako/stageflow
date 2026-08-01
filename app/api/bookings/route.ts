import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVendor } from "@/lib/auth";
import { cleanText } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");

  const bookings = await prisma.booking.findMany({
    where: { vendorId: session.vendor.id, ...(status ? { status: status as any } : {}) },
    include: { client: true, payments: true },
    orderBy: { eventDate: "asc" },
  });

  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { clientId, eventDate, totalFee, depositAmount } = body;
  const eventName = cleanText(body.eventName, 120);
  const eventTime = cleanText(body.eventTime, 30) || null;
  const venue = cleanText(body.venue, 200) || null;
  const city = cleanText(body.city, 120) || null;
  const notes = cleanText(body.notes, 1000) || null;

  if (!clientId || !eventName || !eventDate || totalFee === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.vendorId !== session.vendor.id) {
    return NextResponse.json({ error: "Invalid client" }, { status: 400 });
  }

  const deposit = Number(depositAmount) || 0;

  const booking = await prisma.booking.create({
    data: {
      vendorId: session.vendor.id,
      clientId,
      eventName,
      eventDate: new Date(eventDate),
      eventTime,
      venue,
      city,
      totalFee: Number(totalFee),
      depositAmount: deposit,
      notes,
    },
  });

  if (deposit > 0) {
    await prisma.payment.create({
      data: { bookingId: booking.id, amount: deposit, type: "DEPOSIT", notes: "Initial deposit" },
    });
  }

  return NextResponse.json({ booking }, { status: 201 });
}
