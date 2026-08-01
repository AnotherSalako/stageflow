import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVendor } from "@/lib/auth";
import { cleanText } from "@/lib/sanitize";

async function getOwnedClient(vendorId: string, id: string) {
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client || client.vendorId !== vendorId) return null;
  return client;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: { bookings: { orderBy: { eventDate: "desc" } } },
  });
  if (!client || client.vendorId !== session.vendor.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ client });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getOwnedClient(session.vendor.id, params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const client = await prisma.client.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined && { name: cleanText(body.name, 120) }),
      ...(body.phone !== undefined && { phone: cleanText(body.phone, 30) }),
      ...(body.whatsappNumber !== undefined && { whatsappNumber: cleanText(body.whatsappNumber, 30) || null }),
      ...(body.notes !== undefined && { notes: cleanText(body.notes, 1000) || null }),
    },
  });

  return NextResponse.json({ client });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await getOwnedClient(session.vendor.id, params.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.client.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
