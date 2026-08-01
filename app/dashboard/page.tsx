import Link from "next/link";
import { Plus, Calendar, Users, Bell, Settings } from "lucide-react";
import { requireVendor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORY_ICONS } from "@/lib/categoryIcons";

const ACTIONS = [
  { href: "/dashboard/bookings/new", label: "New booking", Icon: Plus, primary: true },
  { href: "/dashboard/bookings", label: "Bookings", Icon: Calendar },
  { href: "/dashboard/clients", label: "Clients", Icon: Users },
  { href: "/dashboard/reminders", label: "Reminders", Icon: Bell },
  { href: "/dashboard/profile", label: "Profile", Icon: Settings },
];

export default async function DashboardHome() {
  const session = await requireVendor();
  const vendor = session!.vendor;

  const fallbackImage = vendor.coverImageUrl
    ? null
    : await prisma.portfolioItem.findFirst({ where: { vendorId: vendor.id, type: "IMAGE" }, orderBy: { sortOrder: "asc" } });

  const coverImage = vendor.coverImageUrl || fallbackImage?.imageUrl;

  return (
    <div className="flex flex-col gap-6">
      <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
        {ACTIONS.map((a) => (
          <Link key={a.href} href={a.href} className="group flex w-24 shrink-0 snap-center flex-col items-center gap-1.5">
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-150 ease-out group-active:scale-90 ${
                a.primary ? "bg-cappuccino group-active:bg-cappuccino-dark" : "bg-surface group-active:bg-surface2"
              }`}
            >
              <a.Icon size={22} strokeWidth={1.75} className="text-white" />
            </span>
            <span className="text-[11px] font-medium text-stone-400">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Hero — the vendor's own cover + profile picture, front and center */}
      <div className="relative -mx-4 h-64 w-auto overflow-hidden rounded-[28px] bg-gradient-to-br from-surface2 to-bg">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center opacity-30">
            {(() => {
              const Icon = CATEGORY_ICONS[vendor.category];
              return <Icon size={64} strokeWidth={1} className="text-white" />;
            })()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4">
          {vendor.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vendor.avatarUrl} alt="" className="h-14 w-14 shrink-0 rounded-full border-2 border-bg object-cover" />
          )}
          <div>
            <p className="eyebrow text-white/60">Welcome back</p>
            <h1 className="h-display mt-0.5 text-3xl text-white">{vendor.businessName.split(" ")[0]}</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
