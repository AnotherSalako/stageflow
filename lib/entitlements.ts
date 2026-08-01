import { PlanTier, SubscriptionStatus } from "@prisma/client";

export const PLAN_LIMITS = {
  FREE: { portfolioLimit: 5, activeBookingLimit: 5, priorityDiscovery: false, analytics: false },
  PRO: { portfolioLimit: 30, activeBookingLimit: null as number | null, priorityDiscovery: true, analytics: true },
  TEAM: { portfolioLimit: 30, activeBookingLimit: null as number | null, priorityDiscovery: true, analytics: true },
} as const;

export function getPlanLimits(plan: PlanTier) {
  return PLAN_LIMITS[plan];
}

export function isPaidPlan(plan: PlanTier) {
  return plan === "PRO" || plan === "TEAM";
}

// A subscription record can exist with plan=PRO but status=PAST_DUE/CANCELED/UNPAID
// after a failed renewal — access should fall back to FREE immediately in that case,
// not linger on Pro benefits until someone notices. Only ACTIVE/TRIALING count.
export function getEffectivePlan(subscription: { plan: PlanTier; status: SubscriptionStatus } | null | undefined): PlanTier {
  if (!subscription) return "FREE";
  const entitled = subscription.status === "ACTIVE" || subscription.status === "TRIALING";
  return entitled ? subscription.plan : "FREE";
}
