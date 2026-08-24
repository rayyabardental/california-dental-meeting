import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  CircleDashed,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { AdminNav } from "@/components/sections/admin-nav";
import { LogoutButton } from "@/components/sections/admin-roster";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { getPaymentLog, explainAttempt } from "@/lib/payment-log";
import { formatMoney } from "@/lib/checkout";

export const metadata: Metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

// Always read Stripe fresh — this is a live payment log.
export const dynamic = "force-dynamic";

function fmt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

export default async function AdminPaymentsPage(): Promise<React.ReactElement> {
  const cookieStore = await cookies();
  const authed = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authed) redirect("/admin/login");

  let log;
  let loadError: string | null = null;
  try {
    log = await getPaymentLog(100);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Stripe request failed";
  }

  const failures =
    log?.attempts.filter((a) => a.outcome !== "succeeded") ?? [];

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
              Payments
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              Every checkout attempt from Stripe, including the ones that
              didn&apos;t go through. Read-only — nothing here can charge or
              refund.
            </p>
          </div>
          <LogoutButton />
        </div>

        {loadError ? (
          <div className="mt-8 rounded-3xl border border-red-300 bg-red-50 p-6">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Could not read payments
            </p>
            <p className="mt-3 font-mono text-xs text-red-900">{loadError}</p>
          </div>
        ) : !log?.configured ? (
          <div className="mt-8 rounded-3xl border border-gold/40 bg-gold-50/60 p-6 text-sm text-ink">
            Stripe isn&apos;t configured in this environment, so there is no
            payment history to show.
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <StatCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Succeeded"
                value={String(log.counts.succeeded)}
                tone="accent"
              />
              <StatCard
                icon={<XCircle className="h-4 w-4" />}
                label="Declined"
                value={String(log.counts.declined)}
                tone="red"
              />
              <StatCard
                icon={<CircleDashed className="h-4 w-4" />}
                label="Not completed"
                value={String(log.counts.incomplete)}
                tone="muted"
              />
            </div>

            {/* The distinction that matters when diagnosing "it didn't work". */}
            <div className="mt-6 rounded-2xl border border-primary/10 bg-white p-5 text-sm text-ink-muted">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <CreditCard className="h-3.5 w-3.5 text-accent" />
                How to read this
              </p>
              <p className="mt-2.5 leading-relaxed">
                <strong className="text-red-700">Declined</strong> means a card
                was actually submitted and the bank rejected it — the reason and
                decline code are shown.{" "}
                <strong className="text-primary">Not completed</strong> means no
                card ever reached Stripe: the payer opened checkout but never
                submitted the form (abandoned, blocked by a browser extension,
                or stuck on a required field). Nothing was charged or declined,
                so those payers can safely retry.
              </p>
            </div>

            <h2 className="mt-10 font-display text-xl font-medium text-primary">
              Decline &amp; failure log
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Every attempt that didn&apos;t succeed, newest first.
            </p>

            {failures.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-primary/10 bg-white p-10 text-center text-ink-muted">
                No failed or incomplete attempts. Every checkout went through.
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {failures.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-2xl border border-primary/10 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span
                            className={
                              a.outcome === "declined"
                                ? "rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-700"
                                : "rounded-full bg-primary/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted"
                            }
                          >
                            {a.outcome === "declined"
                              ? "Declined"
                              : a.outcome === "processing"
                                ? "Processing"
                                : "Not completed"}
                          </span>
                          <span className="font-medium text-primary">
                            {formatMoney(a.amountCents, a.currency)}
                          </span>
                          <span className="text-sm text-ink-muted">
                            {a.courseTitle ?? "—"}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-ink">
                          {a.name ?? "—"}
                          {a.email && (
                            <>
                              {" · "}
                              <a
                                href={`mailto:${a.email}`}
                                className="text-primary underline-offset-4 hover:underline"
                              >
                                {a.email}
                              </a>
                            </>
                          )}
                        </p>
                      </div>
                      <p className="flex-none text-xs text-ink-muted">
                        {fmt(a.created)}
                      </p>
                    </div>

                    <p className="mt-3 border-t border-primary/8 pt-3 text-sm text-ink-muted">
                      {explainAttempt(a)}
                    </p>

                    {(a.cardBrand || a.errorCode) && (
                      <p className="mt-2 font-mono text-[11px] text-ink-muted">
                        {a.cardBrand && (
                          <>
                            card: {a.cardBrand}
                            {a.cardLast4 ? ` ••${a.cardLast4}` : ""}
                            {a.cardCountry ? ` (${a.cardCountry})` : ""}
                            {"  "}
                          </>
                        )}
                        {a.errorCode && <>code: {a.errorCode}</>}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Container>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "accent" | "red" | "muted";
}): React.ReactElement {
  const toneClass =
    tone === "accent"
      ? "bg-accent/10 text-accent"
      : tone === "red"
        ? "bg-red-100 text-red-700"
        : "bg-primary/8 text-ink-muted";
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white px-5 py-4">
      <span
        className={`grid h-10 w-10 flex-none place-items-center rounded-full ${toneClass}`}
      >
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
