import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, CheckCircle2, Clock, Search } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ClearCart } from "@/components/sections/clear-cart";
import { getStripe } from "@/lib/stripe";
import { getPayPalOrder } from "@/lib/paypal";
import { findEvent } from "@/lib/events-data";
import {
  formatMoney,
  isPurchasable,
  balanceDueCents,
  type PayMode,
} from "@/lib/checkout";
import {
  ensureOrder,
  orderInputFromCourse,
  getOrderByProvider,
} from "@/lib/orders";

export const metadata: Metadata = {
  title: "Registration confirmed",
  robots: { index: false, follow: false },
};

type Summary = {
  title: string;
  dates: string;
  amountCents: number;
  currency: string;
  payMode: PayMode;
  balanceCents: number;
  email: string;
  status: string;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    payment_intent?: string;
    redirect_status?: string;
    paypal_order?: string;
  }>;
}): Promise<React.ReactElement> {
  const { payment_intent, redirect_status, paypal_order } = await searchParams;

  const stripe = getStripe();
  let summary: Summary | null = null;
  let orderNumber: string | null = null;
  if (stripe && payment_intent) {
    try {
      const pi = await stripe.paymentIntents.retrieve(payment_intent);
      const m = pi.metadata ?? {};
      const payMode = (m.payMode as PayMode) ?? "full";
      summary = {
        title: m.courseTitle ?? "Your course",
        dates: m.courseDates ?? "",
        amountCents: pi.amount_received || pi.amount,
        currency: pi.currency,
        payMode,
        balanceCents: Number(m.balanceDueCents ?? "0"),
        email: m.email ?? "",
        status: pi.status,
      };
      // Idempotently create/fetch the order so we can show its number + ICS.
      const course = m.courseId ? findEvent(m.courseId) : undefined;
      if (course && pi.status === "succeeded" && m.email) {
        const rec = await ensureOrder(
          orderInputFromCourse(course, {
            provider: "stripe",
            providerId: pi.id,
            amountPaidCents: pi.amount_received || pi.amount,
            currency: pi.currency,
            payMode,
            balanceDueCents: Number(m.balanceDueCents ?? "0"),
            firstName: m.firstName ?? "",
            lastName: m.lastName ?? "",
            email: m.email,
          }),
        );
        orderNumber = rec?.orderNumber ?? null;
      }
    } catch {
      summary = null;
    }
  } else if (paypal_order) {
    // PayPal path — reconstruct the summary from the captured order. The
    // custom_id we set at create time is "<courseId>:<payMode>".
    try {
      const order = await getPayPalOrder(paypal_order);
      const [courseId, pm] = (order.customId ?? ":").split(":");
      const payMode = (pm as PayMode) || "full";
      const course = courseId ? findEvent(courseId) : undefined;
      summary = {
        title: course?.title ?? "Your course",
        dates: course?.dateLabel ?? "",
        amountCents: order.amountCents,
        currency: order.currency,
        payMode,
        balanceCents:
          course && isPurchasable(course)
            ? balanceDueCents(course, payMode)
            : 0,
        email: "",
        status: order.status === "COMPLETED" ? "succeeded" : order.status,
      };
      // The capture route already created the order — fetch its number.
      const rec = await getOrderByProvider("paypal", paypal_order);
      orderNumber = rec?.orderNumber ?? null;
    } catch {
      summary = null;
    }
  }

  const succeeded =
    redirect_status === "succeeded" || summary?.status === "succeeded";
  const processing =
    !succeeded &&
    (redirect_status === "processing" || summary?.status === "processing");

  return (
    <section className="relative min-h-[70vh] bg-surface py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 gradient-mesh-dark opacity-[0.04]" />
      {succeeded && <ClearCart />}
      <Container size="default">
        <div className="mx-auto max-w-xl rounded-3xl border border-primary/10 bg-white p-8 text-center shadow-[0_20px_50px_-30px_rgba(13,35,64,0.35)] sm:p-12">
          {succeeded ? (
            <>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/10 text-accent">
                <CheckCircle2 className="h-9 w-9" />
              </span>
              <h1 className="mt-6 font-display text-3xl font-medium text-primary md:text-4xl">
                Registration confirmed
              </h1>
              <p className="mt-3 text-ink-muted text-pretty">
                Thank you for registering — your seat is reserved. A payment
                receipt will arrive by email from our payment processor.
              </p>

              {orderNumber && (
                <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-accent/30 bg-accent/[0.06] px-6 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-700">
                    Your order number
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold tracking-wide text-primary">
                    {orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Save this — you can look up your registration any time, no
                    account needed.
                  </p>
                </div>
              )}

              {summary && (
                <dl className="mt-7 space-y-3 rounded-2xl bg-sand-100 p-6 text-left text-sm">
                  <Row label="Course" value={summary.title} />
                  {summary.dates && <Row label="Dates" value={summary.dates} />}
                  <Row
                    label={
                      summary.payMode === "deposit"
                        ? "Deposit paid"
                        : "Tuition paid"
                    }
                    value={formatMoney(summary.amountCents, summary.currency)}
                    strong
                  />
                  {summary.balanceCents > 0 && (
                    <Row
                      label="Balance due before course"
                      value={formatMoney(
                        summary.balanceCents,
                        summary.currency,
                      )}
                    />
                  )}
                </dl>
              )}

              {orderNumber && (
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={`/api/orders/calendar?order=${encodeURIComponent(orderNumber)}`}
                    download
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-[0.95rem] font-medium text-white transition-colors hover:bg-primary-600"
                  >
                    <CalendarPlus className="h-4 w-4" />
                    Add to calendar (.ics)
                  </a>
                  <Button
                    href={`/orders?order=${encodeURIComponent(orderNumber)}`}
                    variant="ghost"
                    size="md"
                  >
                    <Search className="h-4 w-4" />
                    Look up this order
                  </Button>
                </div>
              )}

              <p className="mt-6 text-xs text-ink-muted">
                Our enrollment team will follow up with your full registration
                packet.
              </p>
            </>
          ) : processing ? (
            <>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold-600">
                <Clock className="h-9 w-9" />
              </span>
              <h1 className="mt-6 font-display text-3xl font-medium text-primary md:text-4xl">
                Payment processing
              </h1>
              <p className="mt-3 text-ink-muted text-pretty">
                Your payment is being processed. You&apos;ll receive a
                confirmation email as soon as it clears — no further action is
                needed.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-medium text-primary md:text-4xl">
                Payment not completed
              </h1>
              <p className="mt-3 text-ink-muted text-pretty">
                Your payment wasn&apos;t completed. No charge was made. You can
                return to your cart and try again, or contact our enrollment
                team for help.
              </p>
            </>
          )}

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/" variant="primary" size="lg">
              Back to home
            </Button>
            {!succeeded && (
              <Button href="/cart" variant="ghost" size="lg">
                Return to cart
              </Button>
            )}
          </div>
          {succeeded && (
            <Link
              href="/courses"
              className="mt-5 inline-block text-sm font-medium text-ink-muted underline-offset-4 hover:text-primary hover:underline"
            >
              Browse more courses
            </Link>
          )}
        </div>
      </Container>
    </section>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd
        className={
          strong
            ? "font-display text-base font-semibold text-primary"
            : "font-medium text-primary"
        }
      >
        {value}
      </dd>
    </div>
  );
}
