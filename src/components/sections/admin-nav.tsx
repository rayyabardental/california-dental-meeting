"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Receipt, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Orders", href: "/admin/orders", icon: Receipt },
  { label: "Certificates", href: "/admin/certificates", icon: Award },
] as const;

/** Tab strip shared by the admin pages. */
export function AdminNav(): React.ReactElement {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin sections"
      className="mb-8 flex gap-1 border-b border-primary/10"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              active
                ? "border-accent text-primary"
                : "border-transparent text-ink-muted hover:text-primary",
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
