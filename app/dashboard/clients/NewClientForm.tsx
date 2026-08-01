"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewClientForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, whatsappNumber: phone }),
    });
    setLoading(false);
    setName("");
    setPhone("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary">
        + Add client
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3">
      <input required placeholder="Client name" value={name} onChange={(e) => setName(e.target.value)} className="input" />
      <input required placeholder="Phone / WhatsApp number" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? "Saving..." : "Save client"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-4 py-3">
          Cancel
        </button>
      </div>
    </form>
  );
}
