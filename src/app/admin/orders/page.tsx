import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Users, DollarSign, Receipt } from "lucide-react";
import { Container } from "@/components/ui/container";
import {
  ExportCsvButton,
  LogoutButton,
  type RosterEntry,
} from "@/components/sections/admin-roster";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { listOrders, type OrderRecord } from "@/lib/orders";
import { formatMoney } from "@/lib/checkout";

export const metadata: Metadata = {
  title: "Registrant roster",
  robots: { index: false, follow: false },
};

// Always hit Redis fresh — this is a live payment roster, never cached.
export const dynamic = "force-dynamic";

type CourseGroup = {
  courseId: string;
  courseTitle: string;
  orders: OrderRecord[];
  totalPaidCents: number;
  totalBalanceCents: number;
  currency: string;
};

function groupByCourse(orders: OrderRecord[]): CourseGroup[] {
  const map = new Map<string, CourseGroup>();
  for (const o of orders) {
    const existing = map.get(o.courseId);
    if (existing) {
      existing.orders.push(o);
      existing.totalPaidCents += o.amountPaidCents;
      existing.totalBalanceCents += o.balanceDueCents;
    } else {
      map.set(o.courseId, {
        courseId: o.courseId,
        courseTitle: o.courseTitle,
        orders: [o],
        totalPaidCents: o.amountPaidCents,
        totalBalanceCents: o.balanceDueCents,
        currency: o.currency,
      });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => b.orders.length - a.orders.length,
  );
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

  const orders = await listOrders();
  const groups = groupByCourse(orders);
  const totalPaidCents = orders.reduce((s, o) => s + o.amountPaidCents, 0);
  const totalBalanceCents = orders.reduce((s, o) => s + o.balanceDueCents, 0);

  return (
    <section className="relative bg-surface py-12 lg:py-16">
      <Container size="wide">
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
          <div className="flex items-center gap-3">
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

        {groups.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-primary/10 bg-white p-10 text-center text-ink-muted">
            No orders yet. Confirmed registrations will appear here
            automatically as they come in.
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            {groups.map((g) => (
              <CourseTable key={g.courseId} group={g} />
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

function CourseTable({ group }: { group: CourseGroup }): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-3xl border border-primary/10 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/8 bg-sand-100 px-6 py-4">
        <div>
          <h2 className="font-display text-lg font-medium text-primary">
            {group.courseTitle}
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {group.orders.length}{" "}
            {group.orders.length === 1 ? "registrant" : "registrants"} ·{" "}
            {formatMoney(group.totalPaidCents, group.currency)} collected
            {group.totalBalanceCents > 0 &&
              ` · ${formatMoney(group.totalBalanceCents, group.currency)} outstanding`}
          </p>
        </div>
        <ExportCsvButton
          rows={toRosterEntries(group.orders)}
          filename={`cdm-${group.courseId}-registrants.csv`}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-primary/8 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              <th className="px-6 py-3 font-semibold">Order</th>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Paid</th>
              <th className="px-6 py-3 font-semibold">Balance</th>
              <th className="px-6 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {group.orders.map((o) => (
              <tr
                key={o.orderNumber}
                className="border-b border-primary/6 last:border-0"
              >
                <td className="whitespace-nowrap px-6 py-3 font-medium text-primary">
                  {o.orderNumber}
                </td>
                <td className="whitespace-nowrap px-6 py-3 text-ink">
                  {o.firstName} {o.lastName}
                </td>
                <td className="px-6 py-3 text-ink-muted">
                  <a
                    href={`mailto:${o.email}`}
                    className="hover:text-primary hover:underline"
                  >
                    {o.email}
                  </a>
                </td>
                <td className="whitespace-nowrap px-6 py-3 text-ink">
                  {formatMoney(o.amountPaidCents, o.currency)}
                  {o.payMode === "deposit" && (
                    <span className="ml-1.5 text-xs text-gold-600">
                      (deposit)
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-3 text-ink-muted">
                  {o.balanceDueCents > 0
                    ? formatMoney(o.balanceDueCents, o.currency)
                    : "—"}
                </td>
                <td className="whitespace-nowrap px-6 py-3 text-ink-muted">
                  {new Date(o.purchaseDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
