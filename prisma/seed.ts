import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const vendor = await prisma.vendor.findFirst({ orderBy: { createdAt: "asc" } });

  if (!vendor) {
    console.log(
      "No vendor found. Sign up and complete onboarding in the app first (Clerk creates the user, onboarding creates the Vendor row), then re-run `npm run seed`."
    );
    return;
  }

  const client = await prisma.client.create({
    data: {
      vendorId: vendor.id,
      name: "Chioma Okafor",
      phone: "08098765432",
      whatsappNumber: "2348098765432",
      notes: "Prefers Afrobeats and Amapiano mix.",
    },
  });

  const booking = await prisma.booking.create({
    data: {
      vendorId: vendor.id,
      clientId: client.id,
      eventName: "Wedding Reception",
      eventDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
      eventTime: "16:00",
      venue: "Eko Hotel",
      city: "Victoria Island, Lagos",
      totalFee: 350000,
      depositAmount: 150000,
      status: "CONFIRMED",
    },
  });

  await prisma.payment.create({
    data: { bookingId: booking.id, amount: 150000, type: "DEPOSIT", method: "TRANSFER", notes: "Initial deposit" },
  });

  await prisma.reminder.create({
    data: {
      bookingId: booking.id,
      message: "Ask Chioma for balance payment",
      channel: "WHATSAPP",
      scheduledFor: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.portfolioItem.createMany({
    data: [
      { vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1571266752333-2ed755da9971?w=600", sortOrder: 0 },
      { vendorId: vendor.id, imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600", sortOrder: 1 },
    ],
    skipDuplicates: true,
  });

  console.log(`Seed complete for vendor "${vendor.businessName}" (${vendor.slug}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
