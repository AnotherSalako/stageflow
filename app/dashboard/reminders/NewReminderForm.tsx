"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Booking = { id: string; eventName: string; client: { name: string } };

export default function NewReminderForm({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [channel, setChannel] = useState("WHATSAPP");
  const [bookingId, setBookingId] = useState(bookings[0]?.id || "");
  const [loading, setLoading] = useState(false);

  if (bookings.length === 0) {
    return (
      <div className="card">
        <p className="text-sm text-stone-400">Reminders are tied to a booking. Create a booking first.</p>
        <Link href="/dashboard/bookings/new" className="btn-primary mt-3 inline-block">
          New booking
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, scheduledFor, channel, bookingId }),
    });
    setLoading(false);
    setMessage("");
    setScheduledFor("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        + Add reminder
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3">
      <select value={bookingId} onChange={(e) => setBookingId(e.target.value)} className="input">
        {bookings.map((b) => (
          <option key={b.id} value={b.id}>
            {b.client.name} — {b.eventName}
          </option>
        ))}
      </select>
      <input required placeholder="e.g. Ask for balance payment" value={message} onChange={(e) => setMessage(e.target.value)} className="input" />
      <div className="grid grid-cols-2 gap-2">
        <input required type="date" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} className="input" />
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className="input">
          <option value="WHATSAPP">WhatsApp</option>
          <option value="SMS">SMS</option>
          <option value="CALL">Call</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Saving..." : "Save reminder"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-4 py-3">
          Cancel
        </button>
      </div>
    </form>
  );
}
