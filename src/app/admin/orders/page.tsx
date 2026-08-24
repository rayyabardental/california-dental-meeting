import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Users, DollarSign, Receipt, AlertTriangle } from "lucide-react";
import { Container } from "@/components/ui/container";
import {
  CourseGroupCard,
  ExportCsvButton,
  LogoutButton,
  SyncContactsButton,
  SyncFromStripeButton,
  type RosterEntry,
} from "@/components/sections/admin-roster";
import { AdminNav } from "@/components/sections/admin-nav";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { listOrders, type OrderRecord } from "@/lib/orders";
import { formatMoney } from "@/lib/checkout";
import { findEvent } from "@/lib/events-data";
import { redisHealth } from "@/lib/redis";

export const metadata: Metadata = {
  title: "Registrant roster",
  robots: { index: false, follow: false },
};

// Always hit Redis fresh — this is a live payment roster, never cached.
export const dynamic = "force-dynamic";

type CourseGroup = {
  courseId: string;
  courseTitle: string;
  /** Event start/end dates (from the current course data, falling back to the
   *  order's snapshot) — used to sort upcoming events above past ones. */
  startDate: string;
  endDate?: string;
  dateLabel: string;
  /** Whether the event's end date is still in the future. */
  upcoming: boolean;
  orders: OrderRecord[];
  totalPaidCents: number;
  totalBalanceCents: number;
  currency: string;
};

/** Parse an ISO date to a timestamp; invalid dates sort as long-past. */
function ts(iso: string | undefined): number {
  const t = iso ? new Date(iso).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
}

function groupByCourse(orders: OrderRecord[]): CourseGroup[] {
  const now = Date.now();
  const map = new Map<string, CourseGroup>();
  for (const o of orders) {
    const existing = map.get(o.courseId);
    if (existing) {
      existing.orders.push(o);
      existing.totalPaidCents += o.amountPaidCents;
      existing.totalBalanceCents += o.balanceDueCents;
    } else {
      // Prefer the live course dates (reflect reschedules); fall back to the
      // dates captured on the order when the course is no longer listed.
      const course = findEvent(o.courseId);
      const startDate = course?.date ?? o.startDate;
      const endDate = course?.endDate ?? o.endDate;
      map.set(o.courseId, {
        courseId: o.courseId,
        courseTitle: o.courseTitle,
        startDate,
        endDate,
        dateLabel: course?.dateLabel ?? o.dateLabel,
        upcoming: ts(endDate ?? startDate) >= now,
        orders: [o],
        totalPaidCents: o.amountPaidCents,
        totalBalanceCents: o.balanceDueCents,
        currency: o.currency,
      });
    }
  }

  // Upcoming events first (soonest at the top), then past events (most recently
  // concluded first) toward the bottom.
  return Array.from(map.values()).sort((a, b) => {
    if (a.upcoming !== b.upcoming) return a.upcoming ? -1 : 1;
    if (a.upcoming) return ts(a.startDate) - ts(b.startDate);
    return ts(b.endDate ?? b.startDate) - ts(a.endDate ?? a.startDate);
  });
}

function toRosterEntries(orders: OrderRecord[]): RosterEntry[] {
  return orders.map((o) => ({
    orderNumber: o.orderNumber,
    courseTitle: o.courseTitle,
    firstName: o.firstName,
    lastName: o.lastName,
    email: o.email,
    payMode: o.payMode,
    amountPaidCents: o.amountPaidCents,
    balanceDueCents: o.balanceDueCents,
    currency: o.currency,
    purchaseDate: o.purchaseDate,
  }));
}

export default async function AdminOrdersPage(): Promise<React.ReactElement> {
  const cookieStore = await cookies();
  const authed = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authed) redirect("/admin/login");

  // Distinguish "storage unavailable" from "nobody has registered yet" — on a
  // payment roster those two look identical but mean very different things.
  // Checks real connectivity, not just env presence: credentials can be set
  // and still fail (deleted database, stale URL), which silently drops orders.
  const storage = await redisHealth();
  const storageReady = storage.reachable;
  const orders = storageReady ? await listOrders() : [];
  const groups = groupByCourse(orders);
  const totalPaidCents = orders.reduce((s, o) => s + o.amountPaidCents, 0);
  const totalBalanceCents = orders.reduce((s, o) => s + o.balanceDueCents, 0);

  return (
    <section className="relative bg-surface py-12 lg:py-16">
      <Container size="wide">
        <AdminNav />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-600">
              Admin
            </p>
            <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-primary md:text-4xl">
              Registrant roster
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Every confirmed order, grouped by course. Paid via Stripe or
              PayPal — no card data is stored here.
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <SyncFromStripeButton />
            <SyncContactsButton />
            <ExportCsvButton
              rows={toRosterEntries(orders)}
              filename={`cdm-all-registrants-${new Date().toISOString().slice(0, 10)}.csv`}
            />
            <LogoutButton />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Registrants"
            value={String(orders.length)}
          />
          <StatCard
            icon={<DollarSign className="h-4 w-4" />}
            label="Total collected"
            value={formatMoney(totalPaidCents)}
          />
          <StatCard
            icon={<Receipt className="h-4 w-4" />}
            label="Outstanding balances"
            value={formatMoney(totalBalanceCents)}
          />
        </div>

        {!storageReady ? (
          <div className="mt-10 rounded-3xl border border-red-300 bg-red-50 p-8">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Order storage is unavailable
            </p>
            <p className="mt-3 text-sm leading-relaxed text-red-900">
              This roster is empty because the order database (Upstash Redis)
              could not be reached — <strong>not</strong> because nobody has
              registered. Payments taken while storage is down were still
              charged by Stripe/PayPal, but no order record or order number was
              saved.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-red-900">
              {storage.configured
                ? "Credentials are set but the connection failed — the database may have been deleted or the URL/token is stale. Check the Upstash database in Vercel → Storage, update UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN, and redeploy."
                : "No credentials are set. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in the Vercel project environment variables, then redeploy."}{" "}
              Once storage is back, use <strong>Sync from Stripe</strong> above
              to rebuild any orders that were missed.
            </p>
            {storage.error && (
              <p className="mt-3 font-mono text-xs text-red-700">
                Error: {storage.error}
              </p>
            )}
          </div>
        ) : groups.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-primary/10 bg-white p-10 text-center text-ink-muted">
            No orders yet. Confirmed registrations will appear here
            automatically as they come in.
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {groups.map((g) => (
              <CourseGroupCard
                key={g.courseId}
                courseId={g.courseId}
                courseTitle={g.courseTitle}
                dateLabel={g.dateLabel}
                upcoming={g.upcoming}
                totalPaidCents={g.totalPaidCents}
                totalBalanceCents={g.totalBalanceCents}
                currency={g.currency}
                entries={toRosterEntries(g.orders)}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white px-5 py-4">
      <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-accent/10 text-accent">
        {icon}
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
          {label}
        </p>
        <p className="mt-0.5 font-display text-xl font-medium text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}

