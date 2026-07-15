"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/checkout";
import { cn } from "@/lib/utils";

export type RosterEntry = {
  orderNumber: string;
  courseTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  payMode: "full" | "deposit";
  amountPaidCents: number;
  balanceDueCents: number;
  currency: string;
  purchaseDate: string;
};

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function toCsv(rows: RosterEntry[]): string {
  const header = [
    "Order number",
    "Course",
    "First name",
    "Last name",
    "Email",
    "Pay mode",
    "Amount paid",
    "Balance due",
    "Purchase date",
  ];
  const lines = rows.map((r) =>
    [
      r.orderNumber,
      r.courseTitle,
      r.firstName,
      r.lastName,
      r.email,
      r.payMode,
      formatMoney(r.amountPaidCents, r.currency),
      r.balanceDueCents > 0 ? formatMoney(r.balanceDueCents, r.currency) : "",
      new Date(r.purchaseDate).toLocaleDateString("en-US"),
    ]
      .map((v) => csvEscape(String(v)))
      .join(","),
  );
  return [header.join(","), ...lines].join("\r\n");
}

/** Downloads the given rows as a CSV file named for today's date. */
export function ExportCsvButton({
  rows,
  filename,
}: {
  rows: RosterEntry[];
  filename: string;
}): React.ReactElement {
  const onExport = (): void => {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onExport}
      disabled={rows.length === 0}
    >
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </Button>
  );
}

export function LogoutButton(): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async (): Promise<void> => {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-primary/15 px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-primary/30 hover:text-primary",
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <LogOut className="h-3.5 w-3.5" />
      )}
      Log out
    </button>
  );
}
