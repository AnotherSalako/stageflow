import Link from "next/link";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewClientForm from "./NewClientForm";

export default async function ClientsPage() {
  const session = await requireVendor();
  const clients = await prisma.client.findMany({
    where: { vendorId: session!.vendor.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="h-display text-xl text-white">Clients</h1>

      <NewClientForm />

      <div className="flex flex-col gap-2">
        {clients.length === 0 && <p className="card text-sm text-stone-400">No clients yet. Add your first one above.</p>}
        {clients.map((c) => (
          <Link key={c.id} href={`/dashboard/clients/${c.id}`} className="card flex items-center justify-between">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-stone-400">{c.phone}</p>
            </div>
            <span className="text-xs text-stone-400">{c._count.bookings} booking(s)</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
