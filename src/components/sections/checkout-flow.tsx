"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Elements,
  PaymentElement,
  AddressElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { ArrowLeft, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { findEvent } from "@/lib/events-data";
import {
  isPurchasable,
  amountDueTodayCents,
  balanceDueCents,
  formatMoney,
  type PayMode,
  type PurchasableCourse,
} from "@/lib/checkout";
import { CheckoutSchema } from "@/lib/validations/checkout";
import { useCartStore, useCartHydrated } from "@/lib/cart-store";
import { getStripePromise } from "@/lib/stripe-client";
import { PayPalSection } from "@/components/sections/paypal-section";
import { cn } from "@/lib/utils";

const APPEARANCE: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#0A2540",
    colorText: "#1A1A2E",
    colorDanger: "#dc2626",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
};

const DetailsSchema = CheckoutSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  license: true,
});
type DetailsInput = z.infer<typeof DetailsSchema>;

export function CheckoutFlow(): React.ReactElement {
  const hydrated = useCartHydrated();
  const courseId = useCartStore((s) => s.courseId);
  const payMode = useCartStore((s) => s.payMode);
  const course = courseId ? findEvent(courseId) : undefined;
  const stripePromise = useMemo(() => getStripePromise(), []);

  return (
    <section className="relative min-h-[70vh] bg-surface py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-sand-100 to-transparent" />
      <Container size="default">
        <SectionEyebrow tone="accent">Secure checkout</SectionEyebrow>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl">
          Complete your registration
        </h1>

        {!hydrated ? (
          <div className="mt-12 h-80 animate-pulse rounded-3xl border border-primary/8 bg-white" />
        ) : !course || !isPurchasable(course) ? (
          <NothingToCheckOut />
        ) : !stripePromise ? (
          <PaymentUnavailable />
        ) : (
          <Inner
            course={course}
            payMode={payMode}
            stripePromise={stripePromise}
          />
        )}
      </Container>
    </section>
  );
}

function Inner({
  course,
  payMode,
  stripePromise,
}: {
  course: PurchasableCourse;
  payMode: PayMode;
  stripePromise: NonNullable<ReturnType<typeof getStripePromise>>;
}): React.ReactElement {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [registrant, setRegistrant] = useState<DetailsInput | null>(null);
  const dueToday = amountDueTodayCents(course, payMode);
  const balance = balanceDueCents(course, payMode);
  const currency = course.purchase.currency;

  const onReady = (cs: string, values: DetailsInput): void => {
    setRegistrant(values);
    setClientSecret(cs);
  };

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div className="rounded-3xl border border-primary/10 bg-white p-6 shadow-[0_1px_2px_rgba(13,35,64,0.04)] sm:p-8">
        {clientSecret && registrant ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: APPEARANCE }}
          >
            <PaymentStage
              course={course}
              payMode={payMode}
              registrant={registrant}
              amountLabel={formatMoney(dueToday, currency)}
              onBack={() => setClientSecret(null)}
            />
          </Elements>
        ) : (
          <DetailsStage course={course} payMode={payMode} onReady={onReady} />
        )}
      </div>

      <OrderSummary
        course={course}
        payMode={payMode}
        dueToday={dueToday}
        balance={balance}
        currency={currency}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage 1 — registrant details (creates the PaymentIntent)                   */
/* -------------------------------------------------------------------------- */

function DetailsStage({
  course,
  payMode,
  onReady,
}: {
  course: PurchasableCourse;
  payMode: PayMode;
  onReady: (clientSecret: string, registrant: DetailsInput) => void;
}): React.ReactElement {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DetailsInput>({ resolver: zodResolver(DetailsSchema) });

  const onSubmit = async (values: DetailsInput): Promise<void> => {
    setServerError(null);
    try {
      const res = await fetch("/api/checkout/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, courseId: course.id, payMode }),
      });
      const json = (await res.json()) as {
        data: { clientSecret: string } | null;
        error: string | null;
      };
      if (!res.ok || json.error || !json.data?.clientSecret) {
        setServerError(json.error ?? "Could not start payment. Please try again.");
        return;
      }
      onReady(json.data.clientSecret, values);
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Step n={1} title="Your details" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <TextField
          label="First name"
          error={errors.firstName?.message}
          inputProps={{ autoComplete: "given-name", ...register("firstName") }}
        />
        <TextField
          label="Last name"
          error={errors.lastName?.message}
          inputProps={{ autoComplete: "family-name", ...register("lastName") }}
        />
      </div>
      <TextField
        className="mt-4"
        label="Professional email"
        error={errors.email?.message}
        inputProps={{ type: "email", autoComplete: "email", ...register("email") }}
      />
      <TextField
        className="mt-4"
        label="Dental license number (optional)"
        error={errors.license?.message}
        inputProps={{ autoComplete: "off", ...register("license") }}
      />

      {serverError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting}
        className="mt-6 w-full"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? "Preparing secure payment" : "Continue to payment"}
      </Button>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-muted">
        <Lock className="h-3 w-3 text-accent" />
        Card details are entered on the next step, encrypted by Stripe.
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage 2 — payment (Stripe Elements: card + PayPal + billing address)       */
/* -------------------------------------------------------------------------- */

function PaymentStage({
  course,
  payMode,
  registrant,
  amountLabel,
  onBack,
}: {
  course: PurchasableCourse;
  payMode: PayMode;
  registrant: DetailsInput;
  amountLabel: string;
  onBack: () => void;
}): React.ReactElement {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    // We only reach here if confirmation failed immediately (e.g. card
    // declined). On success, Stripe redirects to the return_url.
    if (submitError) {
      setError(submitError.message ?? "Payment could not be completed.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to details
      </button>

      <Step n={2} title="Payment" />

      <div className="mt-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Billing address
        </p>
        <AddressElement options={{ mode: "billing" }} />
      </div>

      <div className="mt-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          Card or PayPal
        </p>
        <PaymentElement
          options={{
            layout: "tabs",
            // Billing address is collected by AddressElement above.
            fields: { billingDetails: { address: "never" } },
          }}
        />
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={!stripe || processing}
        className="mt-6 w-full"
      >
        {processing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
        {processing ? "Processing…" : `Pay ${amountLabel}`}
      </Button>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-muted">
        <ShieldCheck className="h-3.5 w-3.5 text-accent" />
        Payments are encrypted and processed by Stripe. We never store your card.
      </p>

      <PayPalSection
        course={course}
        payMode={payMode}
        registrant={registrant}
      />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared pieces                                                              */
/* -------------------------------------------------------------------------- */

function OrderSummary({
  course,
  payMode,
  dueToday,
  balance,
  currency,
}: {
  course: PurchasableCourse;
  payMode: PayMode;
  dueToday: number;
  balance: number;
  currency: string;
}): React.ReactElement {
  return (
    <aside className="lg:sticky lg:top-28">
      <div className="rounded-3xl border border-primary/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(13,35,64,0.35)] sm:p-7">
        <h2 className="font-display text-xl font-medium text-primary">
          Order summary
        </h2>
        <div className="mt-5 rounded-2xl bg-sand-100 p-4">
          <p className="font-display text-base font-medium text-primary text-balance">
            {course.title}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {course.dateLabel} · {course.city}, {course.country}
          </p>
          <p className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-700">
            {payMode === "deposit" ? "Reservation deposit" : "Paid in full"}
          </p>
        </div>

        <div className="mt-5 flex items-baseline justify-between border-t border-primary/10 pt-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Due today
          </span>
          <span className="font-display text-3xl font-medium text-primary">
            {formatMoney(dueToday, currency)}
          </span>
        </div>
        {balance > 0 && (
          <p className="mt-2 text-right text-xs text-ink-muted">
            Then {formatMoney(balance, currency)} balance before the course
          </p>
        )}

        <Link
          href="/cart"
          className="mt-5 block text-center text-sm font-medium text-ink-muted underline-offset-4 hover:text-primary hover:underline"
        >
          Edit cart
        </Link>
      </div>
    </aside>
  );
}

function Step({ n, title }: { n: number; title: string }): React.ReactElement {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary font-display text-sm font-semibold text-white">
        {n}
      </span>
      <h2 className="font-display text-2xl font-medium text-primary">{title}</h2>
    </div>
  );
}

function TextField({
  label,
  error,
  inputProps,
  className,
}: {
  label: string;
  error?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
}): React.ReactElement {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </span>
      <input
        {...inputProps}
        aria-invalid={Boolean(error)}
        className="w-full rounded-xl border border-primary/15 bg-surface px-4 py-3 text-sm text-primary outline-none transition-all placeholder:text-ink-muted/60 focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
      />
      {error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function NothingToCheckOut(): React.ReactElement {
  return (
    <div className="mt-12 rounded-3xl border border-primary/10 bg-white px-6 py-16 text-center">
      <h2 className="font-display text-2xl font-medium text-primary">
        Nothing to check out
      </h2>
      <p className="mt-2 text-ink-muted">
        Your cart is empty. Browse our programs to reserve a seat.
      </p>
      <Button href="/courses" variant="primary" size="lg" className="mt-8">
        Explore courses
      </Button>
    </div>
  );
}

function PaymentUnavailable(): React.ReactElement {
  return (
    <div className="mt-12 rounded-3xl border border-gold/30 bg-white px-6 py-16 text-center">
      <h2 className="font-display text-2xl font-medium text-primary">
        Online payment is being set up
      </h2>
      <p className="mx-auto mt-3 max-w-md text-ink-muted text-pretty">
        Card and PayPal checkout will be available here shortly. In the
        meantime, our enrollment team can reserve your seat directly and take
        payment securely.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button href="/contact" variant="primary" size="lg">
          Contact enrollment
        </Button>
        <a
          href="tel:+19514639732"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          +1 (951) 463-9732
        </a>
      </div>
    </div>
  );
}
