import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePlan } from "@/lib/entitlements";
import BillingActions from "./BillingActions";

const PLAN_LABEL: Record<string, string> = { FREE: "Free", PRO: "Pro", TEAM: "Team" };

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  TRIALING: "Trial",
  PAST_DUE: "Payment past due",
  CANCELED: "Cancelled",
  INCOMPLETE: "Incomplete",
  UNPAID: "Unpaid",
};

export default async function BillingPage() {
  const session = await requireVendor();
  const subscription = await prisma.subscription.findUnique({ where: { vendorId: session!.vendor.id } });
  const effectivePlan = getEffectivePlan(subscription);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Settings</p>
        <h1 className="h-display mt-1 text-2xl text-white">Billing</h1>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Current plan</p>
            <p className="h-display mt-1 text-xl text-white">{PLAN_LABEL[effectivePlan]}</p>
          </div>
          {subscription && (
            <span className="badge bg-white/10 text-stone-300">{STATUS_LABEL[subscription.status] || subscription.status}</span>
          )}
        </div>
        {subscription?.currentPeriodEnd && (
          <p className="mt-2 text-xs text-stone-400">
            {subscription.cancelAtPeriodEnd ? "Access ends" : "Renews"} on{" "}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}
        {subscription?.status === "PAST_DUE" && (
          <p className="mt-2 text-xs text-alert">Your last payment failed. Update your payment method to keep Pro features.</p>
        )}
      </div>

      <BillingActions currentPlan={effectivePlan} hasBillingAccount={Boolean(subscription?.stripeCustomerId)} />
    </div>
  );
}
