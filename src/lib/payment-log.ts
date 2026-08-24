import { getStripe } from "@/lib/stripe";

/**
 * Payment attempt log, read from Stripe.
 *
 * Every checkout attempt creates a PaymentIntent, so Stripe holds the full
 * history — including attempts that never completed. Strictly read-only: this
 * module can only list, never charge, refund, or modify.
 *
 * The important distinction it surfaces:
 *   • "declined"   — a card WAS submitted and the bank/Stripe rejected it.
 *                    `last_payment_error` carries the reason + decline code.
 *   • "incomplete" — the payment form was opened but no card ever reached
 *                    Stripe (abandoned, or the payer got stuck). There is no
 *                    error because nothing was ever attempted.
 * Treating those two as the same thing makes a working checkout look broken.
 */
export type AttemptOutcome =
  | "succeeded"
  | "declined"
  | "incomplete"
  | "processing";

export type PaymentAttempt = {
  id: string;
  created: string;
  outcome: AttemptOutcome;
  status: string;
  amountCents: number;
  currency: string;
  courseId: string | null;
  courseTitle: string | null;
  name: string | null;
  email: string | null;
  payMode: string | null;
  /** Populated only when a card was actually submitted and rejected. */
  errorCode: string | null;
  declineCode: string | null;
  errorMessage: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  cardCountry: string | null;
};

export type PaymentLog = {
  configured: boolean;
  attempts: PaymentAttempt[];
  counts: {
    total: number;
    succeeded: number;
    declined: number;
    incomplete: number;
  };
};

function outcomeOf(status: string, hasError: boolean): AttemptOutcome {
  if (status === "succeeded") return "succeeded";
  if (status === "processing" || status === "requires_capture") {
    return "processing";
  }
  // requires_payment_method / requires_confirmation / canceled:
  // a recorded error means a card was tried and rejected.
  return hasError ? "declined" : "incomplete";
}

export async function getPaymentLog(limit = 100): Promise<PaymentLog> {
  const stripe = getStripe();
  if (!stripe) {
    return {
      configured: false,
      attempts: [],
      counts: { total: 0, succeeded: 0, declined: 0, incomplete: 0 },
    };
  }

  const list = await stripe.paymentIntents.list({
    limit: Math.min(Math.max(limit, 1), 100),
  });

  const attempts: PaymentAttempt[] = list.data.map((pi) => {
    const err = pi.last_payment_error;
    const m = pi.metadata ?? {};
    const first = m.firstName ?? "";
    const last = m.lastName ?? "";
    const name = `${first} ${last}`.trim();
    return {
      id: pi.id,
      created: new Date(pi.created * 1000).toISOString(),
      outcome: outcomeOf(pi.status, Boolean(err)),
      status: pi.status,
      amountCents: pi.amount,
      currency: pi.currency,
      courseId: m.courseId ?? null,
      courseTitle: m.courseTitle ?? null,
      name: name || null,
      email: m.email ?? null,
      payMode: m.payMode ?? null,
      errorCode: err?.code ?? null,
      declineCode: err?.decline_code ?? null,
      errorMessage: err?.message ?? null,
      cardBrand: err?.payment_method?.card?.brand ?? null,
      cardLast4: err?.payment_method?.card?.last4 ?? null,
      cardCountry: err?.payment_method?.card?.country ?? null,
    };
  });

  const counts = attempts.reduce(
    (acc, a) => {
      acc.total++;
      if (a.outcome === "succeeded") acc.succeeded++;
      else if (a.outcome === "declined") acc.declined++;
      else if (a.outcome === "incomplete") acc.incomplete++;
      return acc;
    },
    { total: 0, succeeded: 0, declined: 0, incomplete: 0 },
  );

  return { configured: true, attempts, counts };
}

/** Human-readable explanation of why an attempt didn't succeed. */
export function explainAttempt(a: PaymentAttempt): string {
  if (a.outcome === "succeeded") return "Paid successfully.";
  if (a.outcome === "processing") return "Payment is still processing.";
  if (a.outcome === "declined") {
    const reason = a.errorMessage ?? "The card was declined.";
    return a.declineCode ? `${reason} (${a.declineCode})` : reason;
  }
  return "No card was ever submitted — the payer opened checkout but didn't complete the payment form. Nothing was charged or declined.";
}
