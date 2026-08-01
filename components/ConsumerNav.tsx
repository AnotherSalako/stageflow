"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageSquare, Settings } from "lucide-react";

const ITEMS = [
  { href: "/discover", label: "Discover", Icon: Compass },
  { href: "/home", label: "My requests", Icon: MessageSquare },
  { href: "/home/settings", label: "Settings", Icon: Settings },
];

export default function ConsumerNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-white/5 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} aria-label={item.label} className="flex flex-1 items-center justify-center">
              <span className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${active ? "bg-cappuccino" : ""}`}>
                <item.Icon size={20} strokeWidth={1.75} className={active ? "text-black" : "text-white"} />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
