import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerkAppearance";
import PrivacyLink from "@/components/PrivacyLink";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12">
      <SignIn appearance={clerkAppearance} />
      <PrivacyLink />
    </main>
  );
}
