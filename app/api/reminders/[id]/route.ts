import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVendor } from "@/lib/auth";

async function getOwnedReminder(vendorId: string, id: string) {
  const reminder = await prisma.reminder.findUnique({ where: { id }, include: { booking: true } });
  if (!reminder || reminder.booking.vendorId !== vendorId) return null;
  return reminder;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getOwnedReminder(session.vendor.id, params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { sent } = await req.json();
  const reminder = await prisma.reminder.update({
    where: { id: params.id },
    data: { sent, sentAt: sent ? new Date() : null },
  });

  return NextResponse.json({ reminder });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getOwnedReminder(session.vendor.id, params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.reminder.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
