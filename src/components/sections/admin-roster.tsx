"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  LogOut,
  Loader2,
  RefreshCw,
  Mail,
  ChevronRight,
} from "lucide-react";
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

/* -------------------------------------------------------------------------- */
/* Collapsible event group                                                    */
/* -------------------------------------------------------------------------- */

/**
 * One event, collapsed to its name + a one-line summary. Expanding reveals the
 * list of registrants (each of which is itself individually collapsible).
 */
export function CourseGroupCard({
  courseId,
  courseTitle,
  dateLabel,
  upcoming,
  totalPaidCents,
  totalBalanceCents,
  currency,
  entries,
}: {
  courseId: string;
  courseTitle: string;
  dateLabel: string;
  upcoming: boolean;
  totalPaidCents: number;
  totalBalanceCents: number;
  currency: string;
  entries: RosterEntry[];
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const count = entries.length;

  return (
    <div className="overflow-hidden rounded-3xl border border-primary/10 bg-white">
      <div
        className={cn(
          "flex items-center gap-3 bg-sand-100 px-6 py-4",
          open && "border-b border-primary/8",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronRight
            className={cn(
              "h-5 w-5 flex-none text-ink-muted transition-transform",
              open && "rotate-90",
            )}
          />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2.5">
              <span className="font-display text-lg font-medium text-primary">
                {courseTitle}
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                  upcoming
                    ? "bg-accent/10 text-accent-700"
                    : "bg-primary/8 text-ink-muted",
                )}
              >
                {upcoming ? "Upcoming" : "Past"}
              </span>
            </span>
            <span className="mt-0.5 block text-xs text-ink-muted">
              {dateLabel} · {count}{" "}
              {count === 1 ? "registrant" : "registrants"} ·{" "}
              {formatMoney(totalPaidCents, currency)} collected
              {totalBalanceCents > 0 &&
                ` · ${formatMoney(totalBalanceCents, currency)} outstanding`}
            </span>
          </span>
        </button>
        <ExportCsvButton
          rows={entries}
          filename={`cdm-${courseId}-registrants.csv`}
        />
      </div>

      {open && (
        <ul className="divide-y divide-primary/6">
          {entries.map((entry) => (
            <RegistrantRow key={entry.orderNumber} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Collapsible registrant row                                                 */
/* -------------------------------------------------------------------------- */

/**
 * One registrant, collapsed to a summary line (name · order # · amount) that
 * expands to reveal the full details. Keeps a long roster scannable.
 */
export function RegistrantRow({
  entry,
}: {
  entry: RosterEntry;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const paid = formatMoney(entry.amountPaidCents, entry.currency);
  const balance =
    entry.balanceDueCents > 0
      ? formatMoney(entry.balanceDueCents, entry.currency)
      : null;
  const purchaseDate = new Date(entry.purchaseDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-6 py-3.5 text-left transition-colors hover:bg-sand-100/60"
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 flex-none text-ink-muted transition-transform",
            open && "rotate-90",
          )}
        />
        <span className="min-w-0 flex-1 truncate">
          <span className="font-medium text-primary">
            {entry.firstName} {entry.lastName}
          </span>
          <span className="ml-2 text-xs text-ink-muted">
            {entry.orderNumber}
          </span>
        </span>
        <span className="flex-none text-sm font-medium text-ink">
          {paid}
          {entry.payMode === "deposit" && (
            <span className="ml-1.5 text-xs text-gold-600">(deposit)</span>
          )}
        </span>
      </button>

      {open && (
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 px-6 pb-4 pl-[3.25rem] text-sm sm:grid-cols-2">
          <Detail label="Order number" value={entry.orderNumber} />
          <Detail
            label="Name"
            value={`${entry.firstName} ${entry.lastName}`}
          />
          <Detail
            label="Email"
            value={
              <a
                href={`mailto:${entry.email}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {entry.email}
              </a>
            }
          />
          <Detail
            label="Amount paid"
            value={`${paid}${entry.payMode === "deposit" ? " (deposit)" : ""}`}
          />
          <Detail label="Balance due" value={balance ?? "—"} />
          <Detail label="Purchase date" value={purchaseDate} />
        </dl>
      )}
    </li>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-ink">{value}</dd>
    </div>
  );
}

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
