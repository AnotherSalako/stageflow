"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"];

export default function BookingActions({ bookingId, currentStatus }: { bookingId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    if (status === currentStatus) return;
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div>
      <p className="eyebrow mb-2">Update status</p>
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            disabled={loading}
            onClick={() => updateStatus(s)}
            className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide disabled:opacity-50 ${
              s === currentStatus ? "border-cappuccino bg-cappuccino/10 text-cappuccino" : "border-white/10 text-stone-400"
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
