"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SwitchToConsumerButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSwitch() {
    setLoading(true);
    const res = await fetch("/api/account/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "CONSUMER" }),
    });
    setLoading(false);
    if (!res.ok) return;
    router.push("/home");
    router.refresh();
  }

  return (
    <div className="card">
      <p className="font-medium text-white">Browsing for yourself?</p>
      <p className="mt-1 text-sm text-stone-400">Switch to Consumer view to find and book other vendors. Your business profile is saved.</p>
      <button onClick={handleSwitch} disabled={loading} className="btn-secondary mt-3 w-full disabled:opacity-60">
        {loading ? "Switching..." : "Switch to Consumer view"}
      </button>
    </div>
  );
}
