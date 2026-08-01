import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewReminderForm from "./NewReminderForm";
import ReminderItem from "./ReminderItem";

export default async function RemindersPage() {
  const session = await requireVendor();
  const [reminders, bookings] = await Promise.all([
    prisma.reminder.findMany({
      where: { booking: { vendorId: session!.vendor.id } },
      include: { booking: { include: { client: true } } },
      orderBy: [{ sent: "asc" }, { scheduledFor: "asc" }],
    }),
    prisma.booking.findMany({
      where: { vendorId: session!.vendor.id, status: { in: ["PENDING", "CONFIRMED"] } },
      include: { client: true },
      orderBy: { eventDate: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="h-display text-xl text-white">Reminders</h1>

      <NewReminderForm bookings={bookings} />

      <div className="flex flex-col gap-2">
        {reminders.length === 0 && <p className="card text-sm text-stone-400">No reminders yet. Add one above, e.g. "Ask for balance payment".</p>}
        {reminders.map((r) => (
          <ReminderItem key={r.id} reminder={r} />
        ))}
      </div>
    </div>
  );
}
