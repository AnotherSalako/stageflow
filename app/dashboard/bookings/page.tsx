import Link from "next/link";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/money";
import StatusBadge from "@/components/StatusBadge";

const FILTERS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELED"] as const;

export default async function BookingsPage({ searchParams }: { searchParams: { status?: string } }) {
  const session = await requireVendor();
  const status = searchParams.status && searchParams.status !== "ALL" ? searchParams.status : undefined;

  const bookings = await prisma.booking.findMany({
    where: { vendorId: session!.vendor.id, ...(status ? { status: status as any } : {}) },
    include: { client: true, payments: true },
    orderBy: { eventDate: "asc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="h-display text-xl text-white">Bookings</h1>
        <Link href="/dashboard/bookings/new" className="text-sm font-semibold text-cappuccino">
          + New
        </Link>
      </div>

      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "ALL" ? "/dashboard/bookings" : `/dashboard/bookings?status=${f}`}
            className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide ${
              (status || "ALL") === f ? "border-cappuccino bg-cappuccino/10 text-cappuccino" : "border-white/10 text-stone-400"
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {bookings.length === 0 && <p className="card text-sm text-stone-400">No bookings here yet.</p>}
        {bookings.map((b) => {
          const paid = b.payments.reduce((sum, p) => sum + Number(p.amount), 0);
          const balance = Number(b.totalFee) - paid;
          return (
            <Link key={b.id} href={`/dashboard/bookings/${b.id}`} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{b.client.name}</p>
                <p className="text-xs text-stone-400">
                  {b.eventName} ·{" "}
                  {new Date(b.eventDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="mt-1 font-mono text-xs text-stone-400">
                  Balance:{" "}
                  <span className={balance > 0 ? "font-medium text-gold" : "font-medium text-confirmed"}>{formatNaira(balance)}</span>
                </p>
              </div>
              <StatusBadge status={b.status} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
