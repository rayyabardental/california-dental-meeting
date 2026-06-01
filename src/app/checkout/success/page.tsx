import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ClearCart } from "@/components/sections/clear-cart";
import { getStripe } from "@/lib/stripe";
import { formatMoney, type PayMode } from "@/lib/checkout";

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
  }>;
}): Promise<React.ReactElement> {
  const { payment_intent, redirect_status } = await searchParams;

  const stripe = getStripe();
  let summary: Summary | null = null;
  if (stripe && payment_intent) {
    try {
      const pi = await stripe.paymentIntents.retrieve(payment_intent);
      const m = pi.metadata ?? {};
      summary = {
        title: m.courseTitle ?? "Your course",
        dates: m.courseDates ?? "",
        amountCents: pi.amount_received || pi.amount,
        currency: pi.currency,
        payMode: (m.payMode as PayMode) ?? "full",
        balanceCents: Number(m.balanceDueCents ?? "0"),
        email: m.email ?? "",
        status: pi.status,
      };
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
                Thank you for registering. Your seat is reserved and a
                confirmation email is on its way
                {summary?.email ? ` to ${summary.email}` : ""}.
              </p>

              {summary && (
                <dl className="mt-8 space-y-3 rounded-2xl bg-sand-100 p-6 text-left text-sm">
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

              <p className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-muted">
                <Mail className="h-3.5 w-3.5 text-accent" />
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
