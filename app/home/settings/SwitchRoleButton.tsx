"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SwitchRoleButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSwitch() {
    setLoading(true);
    const res = await fetch("/api/account/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "VENDOR" }),
    });
    setLoading(false);
    if (!res.ok) return;
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <button onClick={handleSwitch} disabled={loading} className="btn-secondary mt-3 w-full border-cappuccino/40 text-cappuccino disabled:opacity-60">
      {loading ? "Switching..." : "Switch to Event Professional"}
    </button>
  );
}
