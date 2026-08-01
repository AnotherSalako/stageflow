import Stripe from "stripe";

// Lazily constructed so the app doesn't crash on import when STRIPE_SECRET_KEY
// isn't configured yet (e.g. local dev before billing is activated) — routes
// that actually need Stripe check for this and return a clear 500 instead.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  _stripe = new Stripe(key, { apiVersion: "2026-07-29.dahlia" });
  return _stripe;
}

export type PlanInterval = "month" | "year";

// One Price ID per plan × interval, created in the Stripe dashboard once billing
// is activated. Keeping these as env vars (not hardcoded) means switching from
// a test to a live Stripe account — or between entities — is a config change,
// not a code change.
export const STRIPE_PRICE_IDS: Record<"PRO" | "TEAM", Record<PlanInterval, string | undefined>> = {
  PRO: {
    month: process.env.STRIPE_PRICE_PRO_MONTHLY,
    year: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
  TEAM: {
    month: process.env.STRIPE_PRICE_TEAM_MONTHLY,
    year: process.env.STRIPE_PRICE_TEAM_YEARLY,
  },
};

export function getPlanFromPriceId(priceId: string | null | undefined): "PRO" | "TEAM" | null {
  if (!priceId) return null;
  if (priceId === STRIPE_PRICE_IDS.PRO.month || priceId === STRIPE_PRICE_IDS.PRO.year) return "PRO";
  if (priceId === STRIPE_PRICE_IDS.TEAM.month || priceId === STRIPE_PRICE_IDS.TEAM.year) return "TEAM";
  return null;
}
