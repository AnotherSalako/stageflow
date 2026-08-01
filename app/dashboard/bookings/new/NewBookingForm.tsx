"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Client = { id: string; name: string; phone: string | null };

export default function NewBookingForm({ clients, defaultClientId }: { clients: Client[]; defaultClientId?: string }) {
  const router = useRouter();
  const [clientId, setClientId] = useState(defaultClientId || clients[0]?.id || "");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [totalFee, setTotalFee] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (clients.length === 0) {
    return (
      <div className="card">
        <p className="text-sm text-stone-400">You need to add a client before creating a booking.</p>
        <Link href="/dashboard/clients" className="btn-primary mt-3 inline-block">
          Add a client
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, eventName, eventDate, eventTime, venue, city, totalFee, depositAmount, notes }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }
    const { booking } = await res.json();
    router.push(`/dashboard/bookings/${booking.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Client</label>
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="input">
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.phone}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Event name</label>
        <input required placeholder="e.g. Wedding, Birthday, Owambe" value={eventName} onChange={(e) => setEventName(e.target.value)} className="input" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-300">Event date</label>
          <input required type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="input" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-300">Time (optional)</label>
          <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="input" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Venue (optional)</label>
        <input value={venue} onChange={(e) => setVenue(e.target.value)} className="input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">City (optional)</label>
        <input value={city} onChange={(e) => setCity(e.target.value)} className="input" placeholder="e.g. Lagos" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Total fee (₦)</label>
        <input required type="number" min={0} value={totalFee} onChange={(e) => setTotalFee(e.target.value)} className="input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Deposit already received (₦)</label>
        <input type="number" min={0} value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Notes (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input" rows={3} />
      </div>

      {error && <p className="text-sm text-alert">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
        {loading ? "Saving..." : "Create booking"}
      </button>
    </form>
  );
}
