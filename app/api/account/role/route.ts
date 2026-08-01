import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = await req.json();
  if (!(Object.values(UserRole) as string[]).includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const account = await prisma.userAccount.upsert({
    where: { clerkUserId: userId },
    update: { role },
    create: { clerkUserId: userId, role },
  });

  return NextResponse.json({ account });
}
