import { notFound } from "next/navigation";
import Link from "next/link";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/money";
import StatusBadge from "@/components/StatusBadge";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const session = await requireVendor();
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: { bookings: { orderBy: { eventDate: "desc" } } },
  });

  if (!client || client.vendorId !== session!.vendor.id) notFound();

  const waNumber = client.whatsappNumber || client.phone || "";
  const waLink = `https://wa.me/${waNumber.replace(/[^0-9]/g, "")}`;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="h-display text-xl text-white">{client.name}</h1>
        <p className="text-sm text-stone-400">{client.phone}</p>
      </div>

      <div className="flex gap-2">
        <a href={waLink} target="_blank" className="btn-primary flex-1 text-center">
          💬 WhatsApp
        </a>
        {client.phone && (
          <a href={`tel:${client.phone}`} className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-center">
            📞 Call
          </a>
        )}
      </div>

      {client.notes && (
        <div className="card">
          <p className="text-xs font-medium text-stone-400">Notes</p>
          <p className="mt-1 text-sm">{client.notes}</p>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="eyebrow">Booking history</h2>
          <Link href={`/dashboard/bookings/new?clientId=${client.id}`} className="text-sm text-cappuccino">
            + New booking
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {client.bookings.length === 0 && <p className="card text-sm text-stone-400">No bookings yet.</p>}
          {client.bookings.map((b) => (
            <Link key={b.id} href={`/dashboard/bookings/${b.id}`} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{b.eventName}</p>
                <p className="text-xs text-stone-400">
                  {new Date(b.eventDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}
                  {formatNaira(Number(b.totalFee))}
                </p>
              </div>
              <StatusBadge status={b.status} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
