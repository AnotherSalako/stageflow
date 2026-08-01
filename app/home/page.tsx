import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-gold/15 text-gold",
  CONTACTED: "bg-cappuccino/15 text-cappuccino",
  CONVERTED: "bg-confirmed/15 text-confirmed",
  CLOSED: "bg-white/10 text-stone-400",
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "Sent",
  CONTACTED: "Contacted",
  CONVERTED: "Booked",
  CLOSED: "Closed",
};

export default async function ConsumerHomePage() {
  const { userId } = await auth();

  const myInquiries = await prisma.inquiry.findMany({
    where: { consumerClerkUserId: userId! },
    include: { vendor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Welcome</p>
        <h1 className="h-display mt-1 text-2xl text-white">Find your next vendor</h1>
      </div>

      <Link href="/discover" className="btn-primary">
        Browse DJs, planners, caterers &amp; more
      </Link>

      <section>
        <h2 className="eyebrow mb-2">My requests</h2>
        {myInquiries.length === 0 ? (
          <p className="card text-sm text-stone-400">
            You haven't contacted anyone yet. Browse vendors and send an inquiry to get started.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {myInquiries.map((inq) => {
              const waNumber = inq.vendor.whatsappNumber || inq.vendor.phone || "";
              const waLink = `https://wa.me/${waNumber.replace(/[^0-9]/g, "")}`;
              return (
                <div key={inq.id} className="card">
                  <div className="flex items-center justify-between">
                    <Link href={`/v/${inq.vendor.slug}`} className="font-medium text-white">
                      {inq.vendor.businessName}
                    </Link>
                    <span className={`badge ${STATUS_STYLE[inq.status]}`}>{STATUS_LABEL[inq.status]}</span>
                  </div>
                  {inq.message && <p className="mt-1 text-sm text-stone-300">{inq.message}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <p className="font-mono text-xs text-stone-500">
                      {new Date(inq.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                    </p>
                    <a href={waLink} target="_blank" className="text-sm font-semibold text-cappuccino">
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
