"use client";

import { useRouter } from "next/navigation";

type Reminder = {
  id: string;
  message: string;
  channel: string;
  scheduledFor: string | Date;
  sent: boolean;
  booking: { eventName: string; client: { name: string } };
};

export default function ReminderItem({ reminder }: { reminder: Reminder }) {
  const router = useRouter();

  async function toggleSent() {
    await fetch(`/api/reminders/${reminder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sent: !reminder.sent }),
    });
    router.refresh();
  }

  const overdue = !reminder.sent && new Date(reminder.scheduledFor) < new Date(new Date().toDateString());

  return (
    <div className="card flex items-center gap-3">
      <input type="checkbox" checked={reminder.sent} onChange={toggleSent} className="h-5 w-5 shrink-0 accent-cappuccino" />
      <div className="flex-1">
        <p className={`text-sm font-medium ${reminder.sent ? "text-stone-600 line-through" : ""}`}>{reminder.message}</p>
        <p className="text-xs text-stone-400">
          {reminder.booking.client.name} · {reminder.booking.eventName}
        </p>
      </div>
      <p className={`text-xs ${overdue ? "font-medium text-alert" : "text-stone-400"}`}>
        {new Date(reminder.scheduledFor).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
      </p>
    </div>
  );
}
