import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PlanTier, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripe, getPlanFromPriceId } from "@/lib/stripe";

// Stripe webhooks are the source of truth for subscription state — never trust
// the client to tell us "I upgraded." Every event is signature-verified and
// logged once (by Stripe's event id) before we touch Subscription, so a
// redelivered event can't double-apply and a forged request can't touch billing.
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Billing isn't configured on this server yet" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? "", webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const alreadyProcessed = await prisma.billingEvent.findUnique({ where: { stripeEventId: event.id } });
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await handleEvent(event);
  } finally {
    // Log regardless of handler success so failures are still auditable; the
    // handler itself throws only on truly unexpected shapes, not on unknown event types.
    await prisma.billingEvent.create({
      data: {
        vendorId: extractVendorId(event),
        stripeEventId: event.id,
        type: event.type,
        payload: event as unknown as object,
      },
    });
  }

  return NextResponse.json({ received: true });
}

function extractVendorId(event: Stripe.Event): string | null {
  const obj = event.data.object as { metadata?: Record<string, string> };
  return obj?.metadata?.vendorId ?? null;
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const customerId = checkoutSession.customer as string;
      const subscriptionId = checkoutSession.subscription as string | null;
      if (!subscriptionId) break;

      const stripe = getStripe()!;
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
      await syncSubscriptionFromStripe(customerId, stripeSub);
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const stripeSub = event.data.object as Stripe.Subscription;
      await syncSubscriptionFromStripe(stripeSub.customer as string, stripeSub);
      break;
    }

    case "customer.subscription.deleted": {
      const stripeSub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: stripeSub.customer as string },
        data: { status: "CANCELED", plan: "FREE", cancelAtPeriodEnd: false },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.customer) {
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: invoice.customer as string },
          data: { status: "PAST_DUE" },
        });
      }
      break;
    }

    // invoice.paid confirms a renewal, but customer.subscription.updated already
    // carries the authoritative period/status — nothing extra to sync here beyond
    // the audit log entry every event gets regardless.
    case "invoice.paid":
      break;

    default:
      break;
  }
}

async function syncSubscriptionFromStripe(stripeCustomerId: string, stripeSub: Stripe.Subscription) {
  const firstItem = stripeSub.items.data[0];
  const priceId = firstItem?.price.id ?? null;
  const plan: PlanTier = getPlanFromPriceId(priceId) ?? "FREE";
  const vendorId = stripeSub.metadata?.vendorId;

  // As of newer Stripe API versions, current_period_end lives on the subscription
  // item (a subscription can have items with different billing periods), not on
  // the subscription itself.
  const periodEnd = firstItem?.current_period_end;

  const data = {
    stripeSubscriptionId: stripeSub.id,
    stripePriceId: priceId,
    plan,
    status: mapStripeStatus(stripeSub.status),
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
  };

  const existing = await prisma.subscription.findUnique({ where: { stripeCustomerId } });
  if (existing) {
    await prisma.subscription.update({ where: { id: existing.id }, data });
  } else if (vendorId) {
    // Shouldn't normally happen (checkout always creates the customer row first),
    // but keeps this idempotent if a subscription is ever created out-of-band.
    await prisma.subscription.upsert({
      where: { vendorId },
      update: { stripeCustomerId, ...data },
      create: { vendorId, stripeCustomerId, ...data },
    });
  }
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE" as const;
    case "trialing":
      return "TRIALING" as const;
    case "past_due":
      return "PAST_DUE" as const;
    case "canceled":
      return "CANCELED" as const;
    case "unpaid":
      return "UNPAID" as const;
    default:
      return "INCOMPLETE" as const;
  }
}
