"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Headphones } from "lucide-react";

export default function RoleForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function chooseRole(role: "CONSUMER" | "VENDOR") {
    setLoading(role);
    const res = await fetch("/api/account/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      setLoading(null);
      return;
    }
    router.push(role === "CONSUMER" ? "/home" : "/onboarding");
    router.refresh();
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <button
        onClick={() => chooseRole("CONSUMER")}
        disabled={loading !== null}
        className="card flex items-center gap-4 text-left transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cappuccino">
          <Search size={24} className="text-white" />
        </span>
        <span>
          <p className="font-semibold text-white">I am a Consumer</p>
          <p className="text-sm text-stone-400">Find and book DJs, planners, caterers, and more</p>
        </span>
      </button>

      <button
        onClick={() => chooseRole("VENDOR")}
        disabled={loading !== null}
        className="card flex items-center gap-4 text-left transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface2">
          <Headphones size={24} className="text-white" />
        </span>
        <span>
          <p className="font-semibold text-white">I am a DJ / Event Professional</p>
          <p className="text-sm text-stone-400">Manage bookings, clients, and get discovered</p>
        </span>
      </button>

      {loading && <p className="text-center text-sm text-stone-500">Setting things up...</p>}
    </div>
  );
}
