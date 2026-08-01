import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVendor } from "@/lib/auth";
import { cleanText } from "@/lib/sanitize";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking || booking.vendorId !== session.vendor.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { amount, type, method } = body;
  const notes = cleanText(body.notes, 500) || null;
  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: Number(amount),
      type: type || "OTHER",
      method: method || "TRANSFER",
      notes,
    },
  });

  return NextResponse.json({ payment }, { status: 201 });
}
