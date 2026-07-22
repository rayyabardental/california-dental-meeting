"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, LogOut, Loader2, RefreshCw, Mail } from "lucide-react";
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

/**
 * Rebuilds order records from succeeded Stripe payments. Safe to run any
 * time — recording an order is idempotent, so payments already on the roster
 * are left untouched and never get a second order number.
 */
export function SyncFromStripeButton(): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const onSync = async (): Promise<void> => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/backfill-orders", { method: "POST" });
      const json = (await res.json()) as {
        data: {
          scanned: number;
          createdCount: number;
          alreadyRecorded: number;
        } | null;
        error: string | null;
      };
      if (!res.ok || json.error || !json.data) {
        setResult(json.error ?? "Sync failed.");
      } else {
        const { createdCount, alreadyRecorded, scanned } = json.data;
        setResult(
          `Scanned ${scanned} payments — ${createdCount} recovered, ${alreadyRecorded} already recorded.`,
        );
        if (createdCount > 0) router.refresh();
      }
    } catch {
      setResult("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button variant="outline" size="sm" onClick={onSync} disabled={loading}>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        Sync from Stripe
      </Button>
      {result && (
        <p className="max-w-xs text-right text-[11px] text-ink-muted">
          {result}
        </p>
      )}
    </div>
  );
}

/**
 * Pushes every registrant on the roster into Constant Contact. Safe to
 * re-run — contacts are upserted by email, not duplicated.
 */
export function SyncContactsButton(): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const onSync = async (): Promise<void> => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/sync-contacts", { method: "POST" });
      const json = (await res.json()) as {
        data: { total: number; synced: number; failed: string[] } | null;
        error: string | null;
      };
      if (!res.ok || json.error || !json.data) {
        setResult(json.error ?? "Sync failed.");
      } else {
        const { total, synced, failed } = json.data;
        setResult(
          failed.length > 0
            ? `${synced}/${total} synced — failed: ${failed.join(", ")}`
            : `${synced} of ${total} registrants synced to Constant Contact.`,
        );
      }
    } catch {
      setResult("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button variant="outline" size="sm" onClick={onSync} disabled={loading}>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Mail className="h-3.5 w-3.5" />
        )}
        Sync to Constant Contact
      </Button>
      {result && (
        <p className="max-w-xs text-right text-[11px] text-ink-muted">
          {result}
        </p>
      )}
    </div>
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
