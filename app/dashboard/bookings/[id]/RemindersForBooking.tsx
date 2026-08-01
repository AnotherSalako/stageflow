"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Reminder = {
  id: string;
  message: string;
  channel: string;
  scheduledFor: string | Date;
  sent: boolean;
};

export default function RemindersForBooking({ bookingId, reminders }: { bookingId: string; reminders: Reminder[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [channel, setChannel] = useState("WHATSAPP");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, message, scheduledFor, channel }),
    });
    setLoading(false);
    setMessage("");
    setScheduledFor("");
    setOpen(false);
    router.refresh();
  }

  async function toggleSent(id: string, sent: boolean) {
    await fetch(`/api/reminders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sent: !sent }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {reminders.length === 0 && <p className="card text-sm text-stone-400">No reminders for this booking yet.</p>}
      {reminders.map((r) => (
        <div key={r.id} className="card flex items-center gap-3">
          <input type="checkbox" checked={r.sent} onChange={() => toggleSent(r.id, r.sent)} className="h-5 w-5 shrink-0 accent-cappuccino" />
          <div className="flex-1">
            <p className={`text-sm font-medium ${r.sent ? "text-stone-600 line-through" : "text-stone-200"}`}>{r.message}</p>
            <p className="text-xs text-stone-400">{r.channel.charAt(0) + r.channel.slice(1).toLowerCase()}</p>
          </div>
          <p className="font-mono text-xs text-stone-400">
            {new Date(r.scheduledFor).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
          </p>
        </div>
      ))}

      {open ? (
        <form onSubmit={handleAdd} className="card flex flex-col gap-3">
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
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-secondary mt-1 w-full border-cappuccino/40 text-cappuccino">
          + Add reminder
        </button>
      )}
    </div>
  );
}
