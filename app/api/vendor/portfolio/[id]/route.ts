import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVendor } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const image = await prisma.portfolioItem.findUnique({ where: { id: params.id } });
  if (!image || image.vendorId !== session.vendor.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.portfolioItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
