# StageFlow

Bookings, clients, payments, and discovery — one app for Nigerian event professionals (DJs, planners, caterers, decorators, MCs, venues).

## Stack

Next.js 14 (App Router) · Next.js API routes · PostgreSQL (Supabase) · Prisma · Tailwind CSS · Clerk (auth).

This build connects to an **existing** Supabase Postgres project — the schema in `prisma/schema.prisma` is written to match those tables exactly (`Vendor`, `Client`, `Booking`, `Payment`, `Reminder`, `PortfolioItem`, `Inquiry`). Auth is Clerk rather than a custom email/password flow, because the existing `Vendor.clerkUserId` column ties each vendor to a Clerk user.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Fill in:
   - `DATABASE_URL` — the Postgres connection string from Supabase (Project Settings → Database → Connection string → URI). Use the pooled connection string for serverless-friendly behavior.
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` — from the Clerk dashboard (API Keys page) of the Clerk application that issues the user IDs stored in `Vendor.clerkUserId`.
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY` — used server-side only, for uploading profile/portfolio media to Supabase Storage.
   - Stripe billing vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the four `STRIPE_PRICE_*` ids) are optional — the app runs fine without them, but `/dashboard/billing` will show a clear error instead of a working checkout until they're set. See "Billing setup" below.

3. **Generate the Prisma client** (tables already exist in Supabase, so no migration is needed — just point Prisma at them):

   ```bash
   npx prisma generate
   ```

   Optional sanity check that the schema file matches the live database exactly:

   ```bash
   npx prisma db pull
   ```

4. **Run the app**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000

5. **(Optional) Seed demo data.** Because every `Vendor` row requires a real Clerk user, you can't seed a vendor directly — sign up once through the app first, then seed a demo client/booking/payment/reminder onto that vendor:

   ```bash
   npm run seed
   ```

## Two ways to use the app

Every account starts the same way — Clerk sign-up, then a **role selection screen** (`/choose-role`): "I am a Consumer" or "I am a DJ / Event Professional." Nothing else in the app is reachable until a role is picked.

- **Event professional** → `/onboarding` (creates a `Vendor` row) → `/dashboard` (bookings, clients, payments, reminders, public profile).
- **Consumer** → `/home` (their sent inquiries + a link into `/discover`, the public vendor directory).

Either role can switch later: vendors get a "Switch to Consumer view" button on `/dashboard/profile`; consumers get "Switch to Event Professional" on `/home/settings`. Switching preserves whatever `Vendor` row already exists — nothing is deleted.

## What to test (golden path)

1. Go to `/register`, sign up with Clerk.
2. Land on `/choose-role` — pick a path.
   - **Event professional**: fill in the `/onboarding` form (business name, category, service area, WhatsApp), land on `/dashboard`. Add a client, create a booking with a total fee and deposit, record an additional payment, move status to Confirmed, add a reminder on the booking, fill in `/dashboard/profile` (services/pricing/portfolio/availability), confirm "Make my profile visible to clients" is checked.
   - **Consumer**: land on `/home`, tap through to `/discover`, open a vendor's public profile, submit the inquiry form.
3. Cross-check: the vendor's dashboard home shows the consumer's inquiry with a "Reply on WhatsApp" link; the consumer's `/home` shows the same request under "My requests" with its status.
4. Try switching roles from settings on each side and confirm you land back in the right place.

## ⚠️ Security notice: Row Level Security is disabled

The Supabase project this connects to has **RLS disabled on all 7 tables**. Since this app talks to Postgres directly via Prisma (server-side only, using the database connection string — not the Supabase client SDK with the anon/publishable key), RLS being off doesn't affect this app's own security. But if anything else in your Supabase project (client-side code, other apps) uses the anon/publishable key against these tables, they are fully readable and writable by anyone with that key. Consider enabling RLS with appropriate policies before shipping anything that uses the Supabase client SDK against this project — see the SQL below as a starting point (this will block all access until you add policies, so don't run it without adding policies in the same migration):

```sql
ALTER TABLE public."Vendor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Reminder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PortfolioItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Inquiry" ENABLE ROW LEVEL SECURITY;
```

## Status of this build

Production build is clean across all 31 routes. Live DB connection confirmed via the Supabase session pooler. The vendor-side golden path (sign-up → onboarding → client → booking → payment → public profile → inquiry) has been run end-to-end in a real browser. The consumer/dual-role flow added most recently (role selection, `/home`, role switching) is build-verified but not yet click-tested by a human in a real browser — run the golden path above once before treating it as fully proven.

## Project structure

```
app/
  api/                 # REST-style API routes
    account/role/      # sets/updates a user's role (consumer vs vendor)
    billing/           # checkout, portal, status, webhook (Stripe)
    vendor/upload/     # proxied Supabase Storage upload (avatar/cover/portfolio/QR logo)
  dashboard/           # Authenticated vendor operations UI (bottom-nav mobile app)
    billing/           # Plan display + upgrade/manage UI
    qr/                # Branded QR code generator (client-side)
  home/                # Authenticated consumer UI (my requests, discover, settings)
  choose-role/         # Post-login role selection screen
  onboarding/          # First-run form that creates the Vendor row
  login/, register/    # Clerk <SignIn>/<SignUp> catch-all routes
  v/[slug]/            # Public discovery profile (no auth required)
  discover/            # Public vendor directory/search (no auth required)
  privacy/             # Privacy Policy page (no auth required)
middleware.ts          # Clerk route protection
lib/                   # prisma client, auth/entitlement helpers, stripe client, sanitize, money, category icons
prisma/
  schema.prisma        # data model, matches the live Supabase tables
  seed.ts              # demo data (attaches to the first onboarded vendor)
components/            # shared UI (BottomNav, ConsumerNav, StatusBadge, PrivacyLink)
```

## Setting up your profile & portfolio (for sellers)

From `/dashboard/profile`:

1. **Cover image & profile picture** — tap to upload directly from your phone (JPG/PNG/WEBP/GIF, max 5MB each). These go to Supabase Storage and show up on your public page immediately after saving.
2. **Business info** — name, category, bio, services offered, pricing notes, service area, WhatsApp/phone.
3. **Social links** — optional Instagram/TikTok/YouTube URLs, shown as icons on your public profile.
4. **Availability** — Available / Limited / Booked up, shown as a badge to anyone browsing.
5. **Portfolio** — add up to 12 items: real photo uploads, or paste a video link (YouTube/TikTok) or any other link to your work.
6. Tap **Preview** at the top of the page to see exactly what clients see at `/v/your-slug`.
7. Uncheck "Make my profile visible to clients" to hide your page from `/discover` and direct links without deleting anything.

## Billing setup (Stripe)

Subscriptions are optional to configure — everyone defaults to the Free plan, and `/dashboard/billing` degrades gracefully (clear error instead of a crash) if Stripe isn't set up.

1. In the Stripe dashboard, create two **Products** — "StageFlow Pro" and "StageFlow Team" — each with a monthly and a yearly recurring **Price** (four prices total). Copy each Price ID (`price_...`, not the Product ID) into the matching `STRIPE_PRICE_*` var in `.env`.
2. Copy your Stripe secret key into `STRIPE_SECRET_KEY`.
3. Register a webhook endpoint pointing at `<your-app-url>/api/billing/webhook`, subscribed to at least: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Copy its signing secret into `STRIPE_WEBHOOK_SECRET`. For local dev, use `stripe listen --forward-to localhost:3000/api/billing/webhook`.
4. That's it — `/dashboard/billing` handles checkout (Stripe Checkout, subscription mode) and plan management (Stripe Billing Portal) from there.

**Plan gating**: `lib/entitlements.ts` defines what each plan unlocks (Free: 5 portfolio items, 5 active bookings; Pro/Team: 30 portfolio items, unlimited bookings, priority placement in `/discover`, analytics). `getEffectivePlan()` only treats a subscription as paid while its Stripe status is `ACTIVE` or `TRIALING` — a lapsed/canceled subscription silently falls back to Free without deleting any data.

**Security**: webhook requests are excluded from Clerk's auth middleware (Stripe has no Clerk session) and instead verified by Stripe's signature (`stripe.webhooks.constructEvent`) — an invalid signature is rejected before any database write. Every processed event is logged once by its Stripe event ID (`BillingEvent.stripeEventId` is unique), so a redelivered webhook can't double-apply. Subscription state is always re-read from Stripe by customer ID, never trusted from client-supplied data.

## QR codes

- **Per-vendor QR generator** (`/dashboard/qr`): lets a vendor generate a branded QR code for their own public profile link, for the StageFlow landing page, or for their WhatsApp number — fully client-side (canvas + the `qrcode` package), with an optional logo overlay (reuses the existing `/api/vendor/upload` route), 3 style presets, and PNG/SVG export. Nothing is persisted server-side; there's no scan-history or saved-codes list in v1.
- **App-level QR** on the landing page (`app/page.tsx`): a static code pointing at `NEXT_PUBLIC_APP_URL`, generated server-side once per request with the `qrcode` package's `toDataURL`, styled to match the black/cappuccino palette.

## Privacy Policy

Full policy lives at `/privacy` (`app/privacy/page.tsx`) — covers what's collected, why, who it's shared with (Clerk for auth, Supabase for data/storage, Stripe for billing — named explicitly), user rights, cookies, retention, and NDPR (Nigerian Data Protection Regulation) principles. Linked from the landing page, login page, and account settings on both the vendor and consumer sides; the register page states agreement inline.

## Known v1 simplifications (by design, not oversights)

- A consumer's "My requests" list is just their own `Inquiry` rows (linked via `consumerClerkUserId` when they're logged in when they submit). There's no unification with a vendor's internal `Client` CRM records — those stay separate, vendor-owned contact books.
- Portfolio photos upload to Supabase Storage. YouTube video links are detected and play in an in-app lightbox (thumbnail + tap-to-play); other links (TikTok, anything else) show as a link card that opens in a new tab.
- The Supabase anon key used for uploads is server-side only (`SUPABASE_ANON_KEY`, no `NEXT_PUBLIC_` prefix) — uploads are proxied through `/api/vendor/upload`, which requires a logged-in vendor session, rather than uploading directly from the browser.
- `totalFee` / `depositAmount` / `Payment.amount` are `Decimal` in Postgres; the app converts to `Number` for display and arithmetic (fine at Naira scale, no fractional kobo shown).
- Payments are manually confirmed by the vendor — no payment gateway integration.
- Reminders always belong to a booking (matches the existing schema) — there's no "standalone" reminder not tied to an event.
- No SMS/push notifications yet — reminders live inside the app only.
- Category list is DJ / Event Planner / Caterer / Decorator / MC / Venue / Other, matching the existing `ServiceCategory` enum in the database (no separate Photographer category).
