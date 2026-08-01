"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "DJ", label: "DJ" },
  { value: "EVENT_PLANNER", label: "Event Planner" },
  { value: "CATERER", label: "Caterer" },
  { value: "DECORATOR", label: "Decorator" },
  { value: "MC", label: "MC / Host" },
  { value: "VENUE", label: "Venue" },
  { value: "OTHER", label: "Other" },
];

export default function OnboardingForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    category: "DJ",
    serviceArea: "",
    whatsappNumber: "",
    phone: "",
    bio: "",
    servicesOffered: "",
    pricingNotes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/vendor/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <Field label="Business / stage name">
        <input required value={form.businessName} onChange={(e) => update("businessName", e.target.value)} className="input" placeholder="e.g. DJ Kaycee Entertainment" />
      </Field>
      <Field label="Service category">
        <select value={form.category} onChange={(e) => update("category", e.target.value)} className="input">
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Service area / location">
        <input required value={form.serviceArea} onChange={(e) => update("serviceArea", e.target.value)} className="input" placeholder="e.g. Lekki, Lagos" />
      </Field>
      <Field label="WhatsApp number">
        <input required value={form.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} className="input" placeholder="e.g. 08012345678" />
      </Field>
      <Field label="Phone (optional)">
        <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input" />
      </Field>
      <Field label="Bio (optional)">
        <textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} className="input" rows={3} />
      </Field>
      <Field label="Services offered (optional)">
        <textarea value={form.servicesOffered} onChange={(e) => update("servicesOffered", e.target.value)} className="input" rows={2} placeholder="e.g. Sound system, MC hosting, lighting" />
      </Field>
      <Field label="Pricing notes (optional)">
        <textarea value={form.pricingNotes} onChange={(e) => update("pricingNotes", e.target.value)} className="input" rows={2} placeholder="e.g. Packages start from ₦150,000" />
      </Field>

      {error && <p className="text-sm text-alert">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
        {loading ? "Creating profile..." : "Create profile"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-stone-300">{label}</label>
      {children}
    </div>
  );
}
