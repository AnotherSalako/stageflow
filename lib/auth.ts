import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentVendor() {
  const { userId } = await auth();
  if (!userId) return null;

  const vendor = await prisma.vendor.findUnique({ where: { clerkUserId: userId } });
  return { userId, vendor };
}

export async function requireVendor() {
  const session = await getCurrentVendor();
  if (!session || !session.vendor) return null;
  return { userId: session.userId, vendor: session.vendor };
}

export async function getUserAccount() {
  const { userId } = await auth();
  if (!userId) return null;

  const account = await prisma.userAccount.findUnique({ where: { clerkUserId: userId } });
  return { userId, account };
}
