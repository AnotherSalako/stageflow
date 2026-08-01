import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentVendor } from "@/lib/auth";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const session = await getCurrentVendor();
  if (session?.vendor) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <h1 className="h-display text-2xl text-white">Set up your business</h1>
      <p className="mt-1 text-sm text-stone-400">Takes 2 minutes. You can edit everything later.</p>
      <OnboardingForm />
    </main>
  );
}
