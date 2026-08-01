"use client";

import { useState } from "react";
import { formatNaira } from "@/lib/money";

const PLANS = [
  {
    key: "PRO" as const,
    name: "Pro",
    tagline: "Full profile, priority discovery, unlimited bookings",
    monthly: 4500,
    yearly: 45000,
    features: ["30 portfolio items", "Priority placement in Discover", "Unlimited active bookings", "Simple performance analytics"],
  },
  {
    key: "TEAM" as const,
    name: "Team",
    tagline: "For agencies running more than one gig at once",
    monthly: 12000,
    yearly: 120000,
    features: ["Everything in Pro", "Multiple staff seats", "Advanced reporting", "Priority support"],
  },
];

export default function BillingActions({
  currentPlan,
  hasBillingAccount,
}: {
  currentPlan: "FREE" | "PRO" | "TEAM";
  hasBillingAccount: boolean;
}) {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function upgrade(plan: "PRO" | "TEAM") {
    setError("");
    setLoadingKey(plan);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, interval }),
    });
    const data = await res.json();
    setLoadingKey(null);
    if (!res.ok) {
      setError(data.error || "Couldn't start checkout");
      return;
    }
    window.location.href = data.url;
  }

  async function openPortal() {
    setError("");
    setLoadingKey("portal");
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    setLoadingKey(null);
    if (!res.ok) {
      setError(data.error || "Couldn't open billing portal");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="flex flex-col gap-4">
      {hasBillingAccount && (
        <button onClick={openPortal} disabled={loadingKey === "portal"} className="btn-secondary disabled:opacity-60">
          {loadingKey === "portal" ? "Opening..." : "Manage subscription & payment method"}
        </button>
      )}

      <div className="flex gap-2 self-start rounded-full bg-surface p-1">
        {(["month", "year"] as const).map((i) => (
          <button
            key={i}
            onClick={() => setInterval(i)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${interval === i ? "bg-cappuccino text-black" : "text-stone-400"}`}
          >
            {i === "month" ? "Monthly" : "Yearly (2 months free)"}
          </button>
        ))}
      </div>

      {PLANS.map((plan) => {
        const price = interval === "month" ? plan.monthly : plan.yearly;
        const isCurrent = currentPlan === plan.key;
        return (
          <div key={plan.key} className="card">
            <div className="flex items-baseline justify-between">
              <p className="h-display text-lg text-white">{plan.name}</p>
              <p className="font-display text-lg font-semibold text-white">
                {formatNaira(price)}
                <span className="text-xs font-normal text-stone-400">/{interval === "month" ? "mo" : "yr"}</span>
              </p>
            </div>
            <p className="mt-1 text-sm text-stone-400">{plan.tagline}</p>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm text-stone-300">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <button
              onClick={() => upgrade(plan.key)}
              disabled={isCurrent || loadingKey === plan.key}
              className="btn-primary mt-4 disabled:opacity-50"
            >
              {isCurrent ? "Current plan" : loadingKey === plan.key ? "Starting checkout..." : `Upgrade to ${plan.name}`}
            </button>
          </div>
        );
      })}

      {error && <p className="text-sm text-alert">{error}</p>}

      <p className="text-center text-xs text-stone-500">
        Prices shown in Naira for clarity. You'll be charged via Stripe's secure checkout — card details never touch StageFlow's servers.
      </p>
    </div>
  );
}
