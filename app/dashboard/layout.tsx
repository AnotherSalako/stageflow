import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { getCurrentVendor } from "@/lib/auth";
import BottomNav from "@/components/BottomNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentVendor();
  if (!session) redirect("/login");
  if (!session.vendor) redirect("/onboarding");

  return (
    <div className="mx-auto min-h-screen max-w-md bg-bg pb-24">
      <header className="flex items-center justify-between border-b border-white/5 bg-surface px-4 py-3.5">
        <span className="h-display text-lg tracking-tight text-white">StageFlow</span>
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-stone-400">{session.vendor.businessName}</span>
          <UserButton afterSignOutUrl="/login" />
        </div>
      </header>
      <main className="px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
