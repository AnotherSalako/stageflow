import Link from "next/link";
import { Sparkles } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { CATEGORY_ICONS } from "@/lib/categoryIcons";
import { getEffectivePlan } from "@/lib/entitlements";
import ConsumerNav from "@/components/ConsumerNav";

const CATEGORIES = [
  { value: "", label: "All", Icon: Sparkles },
  { value: "DJ", label: "DJs", Icon: CATEGORY_ICONS.DJ },
  { value: "EVENT_PLANNER", label: "Planners", Icon: CATEGORY_ICONS.EVENT_PLANNER },
  { value: "CATERER", label: "Caterers", Icon: CATEGORY_ICONS.CATERER },
  { value: "DECORATOR", label: "Decorators", Icon: CATEGORY_ICONS.DECORATOR },
  { value: "MC", label: "MCs", Icon: CATEGORY_ICONS.MC },
  { value: "VENUE", label: "Venues", Icon: CATEGORY_ICONS.VENUE },
];

const CATEGORY_LABELS: Record<string, string> = {
  DJ: "DJ",
  EVENT_PLANNER: "Event Planner",
  CATERER: "Caterer",
  DECORATOR: "Decorator",
  MC: "MC / Host",
  VENUE: "Venue",
  OTHER: "Event Professional",
};

const AVAILABILITY_STYLE: Record<string, string> = {
  AVAILABLE: "bg-confirmed text-white",
  LIMITED: "bg-gold text-ink",
  UNAVAILABLE: "bg-white/20 text-white",
};

const AVAILABILITY_LABEL: Record<string, string> = {
  AVAILABLE: "Available",
  LIMITED: "Limited",
  UNAVAILABLE: "Booked",
};

export default async function DiscoverPage({ searchParams }: { searchParams: { category?: string; location?: string } }) {
  const { category, location } = searchParams;

  const { userId } = await auth();

  const rawVendors = await prisma.vendor.findMany({
    where: {
      publicProfile: true,
      ...(category ? { category: category as any } : {}),
      ...(location ? { serviceArea: { contains: location, mode: "insensitive" } } : {}),
    },
    include: {
      portfolio: { where: { type: "IMAGE" }, take: 1, orderBy: { sortOrder: "asc" } },
      subscription: { select: { plan: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Pro/Team vendors surface first — the one piece of paid discovery preference,
  // everything else on this page works identically regardless of plan.
  const vendors = rawVendors.sort((a, b) => {
    const aPriority = getEffectivePlan(a.subscription) !== "FREE" ? 1 : 0;
    const bPriority = getEffectivePlan(b.subscription) !== "FREE" ? 1 : 0;
    return bPriority - aPriority;
  });

  return (
    <main className={`mx-auto min-h-screen max-w-md bg-bg px-4 py-6 ${userId ? "pb-24" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow">StageFlow</p>
          <h1 className="h-display mt-1 text-xl text-white">Find event professionals</h1>
        </div>
        {userId ? (
          <UserButton afterSignOutUrl="/discover" />
        ) : (
          <Link href="/login" className="btn-secondary mt-1 px-4 py-2 text-sm">
            Log in
          </Link>
        )}
      </div>
      <p className="mt-1 text-sm text-stone-400">Browse DJs, planners, caterers, decorators, MCs, and venues near you.</p>

      <form className="mt-4 flex flex-col gap-4" method="get">
        <input type="text" name="location" defaultValue={location} placeholder="Location, e.g. Lekki, Lagos" className="input" />
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => {
            const active = (category || "") === c.value;
            return (
              <Link
                key={c.value}
                href={`/discover?${new URLSearchParams({ ...(c.value ? { category: c.value } : {}), ...(location ? { location } : {}) }).toString()}`}
                className="flex shrink-0 flex-col items-center gap-1.5"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-full ${active ? "bg-cappuccino" : "bg-surface"}`}>
                  <c.Icon size={20} strokeWidth={1.75} className={active ? "text-white" : "text-stone-400"} />
                </span>
                <span className={`text-[11px] font-medium ${active ? "text-cappuccino" : "text-stone-400"}`}>{c.label}</span>
              </Link>
            );
          })}
        </div>
      </form>

      <div className="mt-5 flex flex-col gap-4">
        {vendors.length === 0 && <p className="card text-sm text-stone-400">No vendors found. Try a different filter.</p>}
        {vendors.map((v) => {
          const image = v.coverImageUrl || v.portfolio[0]?.imageUrl;
          const isPro = getEffectivePlan(v.subscription) !== "FREE";
          return (
            <Link key={v.slug} href={`/v/${v.slug}`} className="group relative block h-44 overflow-hidden rounded-[22px] bg-surface">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={v.businessName} className="h-full w-full object-cover transition-transform group-active:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface2 to-bg opacity-40">
                  {(() => {
                    const Icon = CATEGORY_ICONS[v.category];
                    return <Icon size={48} strokeWidth={1.25} className="text-white" />;
                  })()}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

              <div className="absolute right-3 top-3 flex gap-1.5">
                {isPro && <span className="badge bg-cappuccino text-white">Pro</span>}
                <span className={`badge ${AVAILABILITY_STYLE[v.availability]}`}>{AVAILABILITY_LABEL[v.availability]}</span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="eyebrow text-white/60">{CATEGORY_LABELS[v.category]}</p>
                <p className="h-display mt-0.5 text-lg text-white">{v.businessName}</p>
                {v.serviceArea && <p className="text-sm text-white/70">{v.serviceArea}</p>}
              </div>
            </Link>
          );
        })}
      </div>

      {userId && <ConsumerNav />}
    </main>
  );
}
