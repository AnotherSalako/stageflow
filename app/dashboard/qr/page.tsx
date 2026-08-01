import { requireVendor } from "@/lib/auth";
import QrGenerator from "./QrGenerator";

export default async function QrPage() {
  const session = await requireVendor();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const profileUrl = `${appUrl}/v/${session!.vendor.slug}`;
  const whatsapp = session!.vendor.whatsappNumber;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Marketing</p>
        <h1 className="h-display mt-1 text-2xl text-white">QR code</h1>
        <p className="mt-1 text-sm text-stone-400">Print it on flyers, cards, or event signage so people can scan straight to your profile.</p>
      </div>
      <QrGenerator profileUrl={profileUrl} whatsapp={whatsapp} />
    </div>
  );
}
