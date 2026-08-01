import { notFound } from "next/navigation";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/money";
import StatusBadge from "@/components/StatusBadge";
import BookingActions from "./BookingActions";
import AddPaymentForm from "./AddPaymentForm";
import RemindersForBooking from "./RemindersForBooking";

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const session = await requireVendor();
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { client: true, payments: { orderBy: { paidAt: "desc" } }, reminders: { orderBy: { scheduledFor: "asc" } } },
  });

  if (!booking || booking.vendorId !== session!.vendor.id) notFound();

  const paid = booking.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalFee = Number(booking.totalFee);
  const balance = totalFee - paid;
  const waNumber = booking.client.whatsappNumber || booking.client.phone || "";
  const waLink = `https://wa.me/${waNumber.replace(/[^0-9]/g, "")}`;
  const reference = booking.id.slice(-8).toUpperCase();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow">Booking</p>
          <h1 className="h-display mt-1 text-xl text-white">{booking.eventName}</h1>
          <p className="text-sm text-stone-400">{booking.client.name}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Ticket stub — the booking, rendered like an admission ticket */}
      <div className="ticket">
        <div className="grid grid-cols-2 gap-4 p-5">
          <div>
            <p className="eyebrow text-ink/40">Date</p>
            <p className="mt-1 font-medium">
              {new Date(booking.eventDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            {booking.eventTime && <p className="text-sm text-ink/60">{booking.eventTime}</p>}
          </div>
          <div>
            <p className="eyebrow text-ink/40">Venue</p>
            <p className="mt-1 font-medium">{[booking.venue, booking.city].filter(Boolean).join(", ") || "—"}</p>
          </div>
        </div>

        <div className="ticket-perforation" />

        <div className="flex items-center justify-between px-5 pt-4">
          <div>
            <p className="eyebrow text-ink/40">Total</p>
            <p className="mt-1 font-display text-lg font-semibold">{formatNaira(totalFee)}</p>
          </div>
          <div className="text-right">
            <p className="eyebrow text-ink/40">Balance</p>
            <p className={`mt-1 font-display text-lg font-semibold ${balance > 0 ? "text-cappuccino" : "text-confirmed"}`}>
              {formatNaira(balance)}
            </p>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          <div className="barcode" />
          <p className="mt-1.5 text-center font-mono text-[11px] tracking-[0.2em] text-ink/50">REF {reference}</p>
        </div>
      </div>

      {booking.notes && (
        <div className="card">
          <p className="eyebrow">Notes</p>
          <p className="mt-1 text-sm text-stone-200">{booking.notes}</p>
        </div>
      )}

      <a href={waLink} target="_blank" className="btn-primary">
        💬 Message on WhatsApp
      </a>

      <BookingActions bookingId={booking.id} currentStatus={booking.status} />

      <div>
        <h2 className="eyebrow mb-2">Payments</h2>
        <div className="flex flex-col gap-2">
          {booking.payments.length === 0 && <p className="card text-sm text-stone-400">No payments recorded yet.</p>}
          {booking.payments.map((p) => (
            <div key={p.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{formatNaira(Number(p.amount))}</p>
                <p className="text-xs text-stone-400">
                  {p.type.charAt(0) + p.type.slice(1).toLowerCase()} · {p.method.charAt(0) + p.method.slice(1).toLowerCase()}
                  {p.notes ? ` · ${p.notes}` : ""}
                </p>
              </div>
              <p className="font-mono text-xs text-stone-400">
                {new Date(p.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
              </p>
            </div>
          ))}
        </div>
        <AddPaymentForm bookingId={booking.id} />
      </div>

      <div>
        <h2 className="eyebrow mb-2">Reminders</h2>
        <RemindersForBooking bookingId={booking.id} reminders={booking.reminders} />
      </div>
    </div>
  );
}
