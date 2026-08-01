import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserAccount } from "@/lib/auth";
import RoleForm from "./RoleForm";

export default async function ChooseRolePage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const session = await getUserAccount();
  if (session?.account?.role === "CONSUMER") redirect("/home");
  if (session?.account?.role === "VENDOR") redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-bg px-6 py-12">
      <p className="eyebrow">One last step</p>
      <h1 className="h-display mt-2 text-3xl text-white">How will you use StageFlow?</h1>
      <p className="mt-2 text-stone-400">You can switch this later from settings.</p>
      <RoleForm />
    </main>
  );
}
