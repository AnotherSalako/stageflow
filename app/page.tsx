import Link from "next/link";
import QRCode from "qrcode";
import { getUserAccount } from "@/lib/auth";
import { redirect } from "next/navigation";
import PrivacyLink from "@/components/PrivacyLink";

export default async function HomePage() {
  const session = await getUserAccount();
  if (session && !session.account) redirect("/choose-role");
  if (session?.account?.role === "CONSUMER") redirect("/home");
  if (session?.account?.role === "VENDOR") redirect("/dashboard");

  // A static QR for the app itself — generated server-side since the target
  // never changes per-request, unlike the per-vendor generator in the dashboard.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const appQrDataUrl = await QRCode.toDataURL(appUrl, {
    width: 480,
    margin: 3,
    color: { dark: "#12172B", light: "#F3E6D5" },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-bg px-6 py-12">
      <p className="eyebrow">DJs · Planners · Caterers · Decorators · MCs · Venues</p>
      <h1 className="h-display mt-2 text-4xl text-white">StageFlow</h1>
      <p className="mt-3 text-stone-400">
        Every booking, deposit, and follow-up in one place — and a page clients can find you on.
      </p>

      {/* Sample ticket — shows the product's core artifact before anyone signs up */}
      <div className="ticket mt-8">
        <div className="grid grid-cols-2 gap-4 p-5">
          <div>
            <p className="eyebrow text-ink/40">Date</p>
            <p className="mt-1 font-medium">29 Dec</p>
          </div>
          <div>
            <p className="eyebrow text-ink/40">Venue</p>
            <p className="mt-1 font-medium">Eko Hotel, Lagos</p>
          </div>
        </div>
        <div className="ticket-perforation" />
        <div className="flex items-center justify-between px-5 pt-4">
          <div>
            <p className="eyebrow text-ink/40">Total</p>
            <p className="mt-1 font-display text-lg font-semibold">₦350,000</p>
          </div>
          <div className="text-right">
            <p className="eyebrow text-ink/40">Balance</p>
            <p className="mt-1 font-display text-lg font-semibold text-cappuccino">₦150,000</p>
          </div>
        </div>
        <div className="px-5 pb-5 pt-4">
          <div className="barcode" />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Link href="/register" className="btn-primary">
          Create your free account
        </Link>
        <Link href="/login" className="btn-secondary">
          I already have an account
        </Link>
        <Link href="/discover" className="mt-4 text-center text-sm font-medium text-cappuccino">
          Browse vendors on StageFlow →
        </Link>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={appQrDataUrl} alt="Scan to open StageFlow" className="h-28 w-28 rounded-xl" />
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-500">Scan to open StageFlow</p>
      </div>

      <PrivacyLink />
    </main>
  );
}
