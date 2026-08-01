import Link from "next/link";
import SwitchRoleButton from "./SwitchRoleButton";

export default function ConsumerSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Settings</p>
        <h1 className="h-display mt-1 text-2xl text-white">Your account</h1>
      </div>

      <div className="card">
        <p className="font-medium text-white">Switch to Event Professional</p>
        <p className="mt-1 text-sm text-stone-400">
          Are you a DJ, planner, caterer, decorator, MC, or venue? Switch your account to manage bookings and get discovered.
        </p>
        <SwitchRoleButton />
      </div>

      <Link href="/privacy" className="card flex items-center justify-between">
        <span className="font-medium text-white">Privacy Policy</span>
        <span className="text-sm text-cappuccino">View →</span>
      </Link>
    </div>
  );
}
