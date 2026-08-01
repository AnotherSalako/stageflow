import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewBookingForm from "./NewBookingForm";

export default async function NewBookingPage({ searchParams }: { searchParams: { clientId?: string } }) {
  const session = await requireVendor();
  const clients = await prisma.client.findMany({
    where: { vendorId: session!.vendor.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="h-display text-xl text-white">New booking</h1>
      <NewBookingForm clients={clients} defaultClientId={searchParams.clientId} />
    </div>
  );
}
