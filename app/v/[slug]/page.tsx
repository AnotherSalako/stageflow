import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AtSign, Video, Music2, MessageCircle, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORY_ICONS } from "@/lib/categoryIcons";
import InquiryForm from "./InquiryForm";
import BioText from "./BioText";
import PortfolioGallery from "./PortfolioGallery";
import ConsumerNav from "@/components/ConsumerNav";

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
  UNAVAILABLE: "bg-white/15 text-white",
};

const AVAILABILITY_LABEL: Record<string, string> = {
  AVAILABLE: "Available",
  LIMITED: "Limited",
  UNAVAILABLE: "Booked up",
};

export default async function PublicProfilePage({ params }: { params: { slug: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    include: { portfolio: { orderBy: { sortOrder: "asc" } } },
  });

  if (!vendor || !vendor.publicProfile) notFound();

  const { userId } = await auth();
  const completedBookings = await prisma.booking.count({ where: { vendorId: vendor.id, status: "COMPLETED" } });
  const memberSince = vendor.createdAt.getFullYear();

  const waNumber = vendor.whatsappNumber || vendor.phone || "";
  const waLink = `https://wa.me/${waNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hi ${vendor.businessName}, I found you on StageFlow and I'd like to make an inquiry.`
  )}`;
  const backgroundImage = vendor.coverImageUrl || vendor.portfolio.find((p) => p.type === "IMAGE")?.imageUrl;
  const socials = [
    vendor.instagramUrl && { href: vendor.instagramUrl, Icon: AtSign, label: "Instagram" },
    vendor.tiktokUrl && { href: vendor.tiktokUrl, Icon: Music2, label: "TikTok" },
    vendor.youtubeUrl && { href: vendor.youtubeUrl, Icon: Video, label: "YouTube" },
  ].filter(Boolean) as { href: string; Icon: typeof AtSign; label: string }[];

  return (
    <main className={`mx-auto min-h-screen max-w-md bg-bg ${userId ? "pb-24" : "pb-10"}`}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link
          href="/discover"
          aria-label="Back to discover"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-white"
        >
          ←
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{vendor.businessName}</p>
          {vendor.serviceArea && <p className="truncate text-xs text-stone-400">{vendor.serviceArea}</p>}
        </div>
        <a
          href={waLink}
          target="_blank"
          aria-label="Message on WhatsApp"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-white"
        >
          <MessageCircle size={18} />
        </a>
        {vendor.phone && (
          <a
            href={`tel:${vendor.phone}`}
            aria-label="Call"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-white"
          >
            <Phone size={18} />
          </a>
        )}
      </div>

      {/* Photo card — profile picture centered over the cover/background photo */}
      <div className="relative mx-4 mt-4 aspect-[4/5] overflow-hidden rounded-[28px] bg-gradient-to-br from-surface2 to-bg">
        {backgroundImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center opacity-30">
            {(() => {
              const Icon = CATEGORY_ICONS[vendor.category];
              return <Icon size={64} strokeWidth={1} className="text-white" />;
            })()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/30" />

        {vendor.avatarUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={vendor.avatarUrl}
              alt={vendor.businessName}
              className="h-52 w-52 rounded-full border-4 border-bg object-cover shadow-xl"
            />
          </div>
        )}

        <span className={`badge absolute -bottom-3 left-4 ${AVAILABILITY_STYLE[vendor.availability]}`}>
          {CATEGORY_LABELS[vendor.category]} · {AVAILABILITY_LABEL[vendor.availability]}
        </span>
      </div>

      <div className="px-4 pt-6">
        {socials.length > 0 && (
          <div className="mb-4 flex gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-stone-300"
              >
                <s.Icon size={16} />
              </a>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="card flex items-center justify-between">
          <Stat value={completedBookings} label="Bookings done" />
          <div className="h-8 w-px bg-white/10" />
          <Stat value={vendor.portfolio.length} label="Portfolio" />
          <div className="h-8 w-px bg-white/10" />
          <Stat value={memberSince} label="Since" />
        </div>

        {vendor.bio && (
          <div className="mt-6">
            <span className="badge bg-surface text-stone-300">About {vendor.businessName.split(" ")[0]}</span>
            <BioText bio={vendor.bio} />
          </div>
        )}

        {(vendor.servicesOffered || vendor.pricingNotes) && (
          <div className="card mt-4 flex flex-col gap-3">
            {vendor.servicesOffered && (
              <div>
                <p className="eyebrow">Services</p>
                <p className="mt-1 text-sm text-stone-200">{vendor.servicesOffered}</p>
              </div>
            )}
            {vendor.pricingNotes && (
              <div>
                <p className="eyebrow">Pricing</p>
                <p className="mt-1 text-sm text-stone-200">{vendor.pricingNotes}</p>
              </div>
            )}
          </div>
        )}

        {vendor.portfolio.length > 0 && (
          <div className="mt-6">
            <h2 className="eyebrow mb-2">Portfolio</h2>
            <PortfolioGallery items={vendor.portfolio} businessName={vendor.businessName} />
          </div>
        )}

        <div className="mt-6">
          <h2 className="eyebrow mb-2">Send an inquiry</h2>
          <InquiryForm slug={vendor.slug} />
        </div>

        <a href={waLink} target="_blank" className="btn-primary mt-6 block">
          💬 Message on WhatsApp
        </a>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-stone-600">Powered by StageFlow</p>
      </div>

      {userId && <ConsumerNav />}
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="font-display text-lg font-semibold text-white">{value}</p>
      <p className="text-[11px] text-stone-400">{label}</p>
    </div>
  );
}
