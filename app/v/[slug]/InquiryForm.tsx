"use client";

import { useState } from "react";

export default function InquiryForm({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`/api/public/${slug}/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, message, eventDate: eventDate || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card text-sm text-confirmed">
        Thanks! Your inquiry has been sent. For a faster reply, message on WhatsApp above.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3">
      <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="input" />
      <input required placeholder="Your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
      <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="input" />
      <textarea required placeholder="Tell them about your event" value={message} onChange={(e) => setMessage(e.target.value)} className="input" rows={3} />
      {error && <p className="text-sm text-alert">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
        {loading ? "Sending..." : "Send inquiry"}
      </button>
    </form>
  );
}
