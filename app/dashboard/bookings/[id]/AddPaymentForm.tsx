"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPaymentForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("BALANCE");
  const [method, setMethod] = useState("TRANSFER");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, type, method, notes }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }
    setAmount("");
    setNotes("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary mt-2 w-full border-cappuccino/40 text-cappuccino">
        + Record a payment
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-2 flex flex-col gap-3">
      <p className="text-xs text-stone-400">Confirm payment manually after receiving transfer, cash, or POS.</p>
      <input required type="number" min={1} placeholder="Amount received (₦)" value={amount} onChange={(e) => setAmount(e.target.value)} className="input" />
      <div className="grid grid-cols-2 gap-2">
        <select value={type} onChange={(e) => setType(e.target.value)} className="input">
          <option value="DEPOSIT">Deposit</option>
          <option value="BALANCE">Balance</option>
          <option value="OTHER">Other</option>
        </select>
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="input">
          <option value="TRANSFER">Bank transfer</option>
          <option value="CASH">Cash</option>
          <option value="POS">POS</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <input placeholder="Note (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
      {error && <p className="text-sm text-alert">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Saving..." : "Confirm payment"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
