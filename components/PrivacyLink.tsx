import Link from "next/link";

export default function PrivacyLink() {
  return (
    <p className="mt-6 text-center text-xs text-stone-500">
      <Link href="/privacy" className="underline">
        Privacy Policy
      </Link>
    </p>
  );
}
