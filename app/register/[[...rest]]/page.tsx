import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerkAppearance";
import PrivacyLink from "@/components/PrivacyLink";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12">
      <SignUp forceRedirectUrl="/onboarding" appearance={clerkAppearance} />
      <p className="mt-4 max-w-sm text-center text-xs text-stone-500">
        By creating an account you agree to our{" "}
        <a href="/privacy" className="underline">
          Privacy Policy
        </a>
        .
      </p>
    </main>
  );
}
