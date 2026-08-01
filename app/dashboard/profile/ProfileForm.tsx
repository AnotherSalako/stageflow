"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";

const CATEGORIES = [
  { value: "DJ", label: "DJ" },
  { value: "EVENT_PLANNER", label: "Event Planner" },
  { value: "CATERER", label: "Caterer" },
  { value: "DECORATOR", label: "Decorator" },
  { value: "MC", label: "MC / Host" },
  { value: "VENUE", label: "Venue" },
  { value: "OTHER", label: "Other" },
];

const AVAILABILITY = [
  { value: "AVAILABLE", label: "Available for bookings" },
  { value: "LIMITED", label: "Limited availability" },
  { value: "UNAVAILABLE", label: "Not taking bookings" },
];

type Vendor = {
  id: string;
  slug: string;
  businessName: string;
  category: string;
  bio: string | null;
  servicesOffered: string | null;
  pricingNotes: string | null;
  serviceArea: string | null;
  whatsappNumber: string | null;
  phone: string | null;
  availability: string;
  publicProfile: boolean;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
};

export default function ProfileForm({ vendor }: { vendor: Vendor }) {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: vendor.businessName,
    category: vendor.category,
    bio: vendor.bio || "",
    servicesOffered: vendor.servicesOffered || "",
    pricingNotes: vendor.pricingNotes || "",
    serviceArea: vendor.serviceArea || "",
    whatsappNumber: vendor.whatsappNumber || "",
    phone: vendor.phone || "",
    availability: vendor.availability,
    publicProfile: vendor.publicProfile,
    slug: vendor.slug,
    avatarUrl: vendor.avatarUrl,
    coverImageUrl: vendor.coverImageUrl,
    instagramUrl: vendor.instagramUrl || "",
    tiktokUrl: vendor.tiktokUrl || "",
    youtubeUrl: vendor.youtubeUrl || "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/vendor", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Cover image</label>
        <ImageUpload value={form.coverImageUrl} onChange={(url) => update("coverImageUrl", url)} shape="rect" emptyLabel="Add cover image" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Profile picture</label>
        <ImageUpload value={form.avatarUrl} onChange={(url) => update("avatarUrl", url)} shape="circle" emptyLabel="Add photo" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Business / stage name</label>
        <input required value={form.businessName} onChange={(e) => update("businessName", e.target.value)} className="input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Category</label>
        <select value={form.category} onChange={(e) => update("category", e.target.value)} className="input">
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Bio</label>
        <textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} className="input" rows={3} placeholder="Tell clients what makes you great" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Services offered</label>
        <textarea value={form.servicesOffered} onChange={(e) => update("servicesOffered", e.target.value)} className="input" rows={2} placeholder="e.g. Sound system, MC hosting, lighting" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Pricing notes</label>
        <textarea value={form.pricingNotes} onChange={(e) => update("pricingNotes", e.target.value)} className="input" rows={2} placeholder="e.g. Packages start from ₦150,000" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Service area / location</label>
        <input required value={form.serviceArea} onChange={(e) => update("serviceArea", e.target.value)} className="input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">WhatsApp number</label>
        <input required value={form.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} className="input" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Phone (optional)</label>
        <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="input" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-300">Instagram (optional)</label>
          <input value={form.instagramUrl} onChange={(e) => update("instagramUrl", e.target.value)} className="input" placeholder="https://instagram.com/..." />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-300">TikTok (optional)</label>
          <input value={form.tiktokUrl} onChange={(e) => update("tiktokUrl", e.target.value)} className="input" placeholder="https://tiktok.com/@..." />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-300">YouTube (optional)</label>
          <input value={form.youtubeUrl} onChange={(e) => update("youtubeUrl", e.target.value)} className="input" placeholder="https://youtube.com/@..." />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Availability</label>
        <select value={form.availability} onChange={(e) => update("availability", e.target.value)} className="input">
          {AVAILABILITY.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-300">
        <input type="checkbox" checked={form.publicProfile} onChange={(e) => update("publicProfile", e.target.checked)} className="h-4 w-4 accent-cappuccino" />
        Make my profile visible to clients
      </label>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-300">Profile link</label>
        <div className="flex items-center gap-1 text-sm text-stone-400">
          <span>stageflow.app/v/</span>
          <input value={form.slug} onChange={(e) => update("slug", e.target.value)} className="input flex-1" />
        </div>
      </div>

      {error && <p className="text-sm text-alert">{error}</p>}
      {saved && <p className="text-sm text-confirmed">Saved.</p>}

      <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
        {loading ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
