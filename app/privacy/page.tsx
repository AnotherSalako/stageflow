import Link from "next/link";

export const metadata = { title: "Privacy Policy — StageFlow" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="h-display text-lg text-white">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-stone-300">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-bg px-4 py-8">
      <Link href="/" className="text-sm font-medium text-cappuccino">
        ← Back to StageFlow
      </Link>

      <p className="eyebrow mt-6">Legal</p>
      <h1 className="h-display mt-1 text-2xl text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-stone-400">Last updated: 1 August 2026</p>

      <p className="mt-4 text-sm leading-relaxed text-stone-300">
        StageFlow ("we", "us") helps event professionals in Nigeria get discovered and manage bookings, and helps
        clients find and contact them. This policy explains what information we collect, why, and what control you
        have over it. We've tried to write it in plain language rather than legal boilerplate.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        <Section title="1. What we collect">
          <p>
            <strong className="text-white">Account information:</strong> your name, email address, and phone number
            when you sign up.
          </p>
          <p>
            <strong className="text-white">Vendor profile data:</strong> business name, category, bio, service area,
            WhatsApp number, pricing notes, availability, social links, and any photos, videos, or links you upload
            to your portfolio.
          </p>
          <p>
            <strong className="text-white">Booking & operations data:</strong> clients you add to your own contact
            list, bookings, deposits and payments you record, and reminders you set. This is data you enter yourself
            to run your business — we don't independently verify it.
          </p>
          <p>
            <strong className="text-white">Inquiries:</strong> when a client contacts a vendor through StageFlow, we
            store their name, phone number, and message so the vendor can respond and so the client can see the
            status of their own request.
          </p>
          <p>
            <strong className="text-white">Billing data:</strong> if you subscribe to a paid plan, Stripe (our
            payment processor) handles your card details directly — we never see or store your full card number. We
            store only your subscription status, plan, and renewal date.
          </p>
          <p>
            <strong className="text-white">Device & usage logs:</strong> basic technical information (IP address,
            browser type, pages visited) collected automatically for security and to keep the app working reliably.
          </p>
        </Section>

        <Section title="2. Why we collect it">
          <p>To create and run your account, and to deliver the actual service — bookings, discovery, and payments.</p>
          <p>To process subscription payments and keep your billing status accurate.</p>
          <p>To keep the platform secure and prevent abuse or fraud.</p>
          <p>To improve StageFlow based on how it's actually used.</p>
          <p>To meet legal obligations where required (for example, responding to a lawful request from an authority).</p>
        </Section>

        <Section title="3. How we use it">
          <ul className="ml-4 list-disc">
            <li>Running the day-to-day product: your dashboard, your public profile, the discovery directory, bookings, and reminders.</li>
            <li>Matching clients with vendors through search and category browsing.</li>
            <li>Sending practical, non-marketing notifications about your own account and bookings.</li>
            <li>Basic analytics to understand which features are used, so we can prioritize what to build next.</li>
            <li>Detecting and preventing fraudulent or abusive activity.</li>
          </ul>
        </Section>

        <Section title="4. Who we share it with">
          <p>We do not sell your personal data. We share it only with:</p>
          <ul className="ml-4 list-disc">
            <li>
              <strong className="text-white">Clerk</strong> — our authentication provider, which handles sign-up, login, and session
              security.
            </li>
            <li>
              <strong className="text-white">Supabase</strong> — our database and file storage provider, hosting your data and
              uploaded images.
            </li>
            <li>
              <strong className="text-white">Stripe</strong> — our payment processor for paid subscriptions, if you upgrade.
            </li>
            <li>Other users, as intended by the product — your public profile (if you enable it) is visible to anyone browsing StageFlow, and inquiries you send/receive are visible to the vendor/consumer involved.</li>
            <li>Legal authorities, only if required by valid legal process.</li>
          </ul>
        </Section>

        <Section title="5. How we protect it">
          <ul className="ml-4 list-disc">
            <li>Data is encrypted in transit (HTTPS) between your device and our servers.</li>
            <li>Passwords and authentication are handled entirely by Clerk — we never see or store your password.</li>
            <li>Payment card details are handled entirely by Stripe — we never see or store full card numbers.</li>
            <li>Access to production data is limited to what's needed to operate the service.</li>
            <li>Uploaded files are validated for type and size before storage.</li>
          </ul>
        </Section>

        <Section title="6. Your rights">
          <p>You can:</p>
          <ul className="ml-4 list-disc">
            <li><strong className="text-white">Access</strong> the personal data we hold about you.</li>
            <li><strong className="text-white">Correct</strong> inaccurate information — most of your profile and account data can be edited directly in the app.</li>
            <li><strong className="text-white">Delete</strong> your account and associated data by contacting us.</li>
            <li><strong className="text-white">Opt out</strong> of any non-essential marketing communication (StageFlow currently sends none beyond account/booking-related notices).</li>
            <li><strong className="text-white">Hide your public profile</strong> from Discover at any time via the "Make my profile visible to clients" toggle in your profile settings — this doesn't delete your data, it just stops showing it publicly.</li>
          </ul>
          <p>To exercise any of these, contact us using the details below.</p>
        </Section>

        <Section title="7. Cookies & tracking">
          <p>
            We use essential cookies for authentication (set by Clerk) to keep you signed in. We do not currently use
            third-party advertising trackers or sell data to ad networks.
          </p>
        </Section>

        <Section title="8. Data retention">
          <p>
            We keep account and operational data for as long as your account is active, so the app continues to work
            correctly. If you delete your account, we remove your personal data within a reasonable period, except
            where we're required to retain limited records for legal, tax, or dispute-resolution purposes (for
            example, billing records).
          </p>
        </Section>

        <Section title="9. Nigerian data protection">
          <p>
            We aim to handle personal data in line with the principles of Nigeria's Data Protection Act/NDPR: we
            collect only what's needed for the service (data minimization), use it only for the purposes described
            here (purpose limitation), keep it reasonably secure, and respect the rights listed above.
          </p>
        </Section>

        <Section title="10. Changes to this policy">
          <p>
            If we make material changes to this policy, we'll update the "Last updated" date above and, where
            appropriate, notify you in the app.
          </p>
        </Section>

        <Section title="11. Contact us">
          <p>
            Questions about this policy or your data? Email{" "}
            <a href="mailto:privacy@stageflow.app" className="text-cappuccino underline">
              privacy@stageflow.app
            </a>
            .
          </p>
        </Section>
      </div>

      <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-stone-600">StageFlow</p>
    </main>
  );
}
