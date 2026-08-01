import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { getUserAccount } from "@/lib/auth";
import ConsumerNav from "@/components/ConsumerNav";

export default async function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const session = await getUserAccount();
  if (!session) redirect("/login");
  if (!session.account) redirect("/choose-role");
  if (session.account.role !== "CONSUMER") redirect("/dashboard");

  return (
    <div className="mx-auto min-h-screen max-w-md bg-bg pb-24">
      <header className="flex items-center justify-between border-b border-white/5 bg-surface px-4 py-3.5">
        <span className="h-display text-lg tracking-tight text-white">StageFlow</span>
        <UserButton afterSignOutUrl="/login" />
      </header>
      <main className="px-4 py-4">{children}</main>
      <ConsumerNav />
    </div>
  );
}
