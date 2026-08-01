import Link from "next/link";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";
import PortfolioManager from "./PortfolioManager";
import SwitchToConsumerButton from "./SwitchToConsumerButton";

export default async function ProfilePage() {
  const session = await requireVendor();
  const vendor = await prisma.vendor.findUnique({
    where: { id: session!.vendor.id },
    include: { portfolio: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="h-display text-xl text-white">Your public profile</h1>
        <p className="text-sm text-stone-400">
          This is what clients see when they find you on StageFlow.{" "}
          <a href={`/v/${vendor!.slug}`} target="_blank" className="font-medium text-cappuccino underline">
            Preview →
          </a>
        </p>
      </div>

      <ProfileForm vendor={vendor!} />

      <div>
        <h2 className="eyebrow mb-2">Portfolio</h2>
        <PortfolioManager images={vendor!.portfolio} />
      </div>

      <Link href="/dashboard/billing" className="card flex items-center justify-between">
        <span className="font-medium text-white">Billing & plan</span>
        <span className="text-sm text-cappuccino">Manage →</span>
      </Link>

      <Link href="/dashboard/qr" className="card flex items-center justify-between">
        <span className="font-medium text-white">QR code for your profile</span>
        <span className="text-sm text-cappuccino">Generate →</span>
      </Link>

      <SwitchToConsumerButton />

      <Link href="/privacy" className="text-center text-xs text-stone-500 underline">
        Privacy Policy
      </Link>
    </div>
  );
}
