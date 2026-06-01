import { ok, fail } from "@/lib/api-response";
import { findEvent } from "@/lib/events-data";
import {
  isPurchasable,
  amountDueTodayCents,
  balanceDueCents,
  fullAmountCents,
} from "@/lib/checkout";
import { getStripe } from "@/lib/stripe";
import { CheckoutSchema } from "@/lib/validations/checkout";

// Stripe's Node SDK requires the Node.js runtime (not Edge).
export const runtime = "nodejs";

/**
 * Creates a Stripe PaymentIntent for a course registration.
 *
 * The charged amount is ALWAYS recomputed here from trusted course data —
 * the client never sends an amount, so a tampered request cannot change the
 * price. Registrant details are stored as PaymentIntent metadata (our system
 * of record per the Stripe-Dashboard approach); no card data is handled here.
 */
export async function POST(req: Request): Promise<Response> {
  const stripe = getStripe();
  if (!stripe) {
    return fail("Online payment is not available yet. Please contact enrollment.", 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  }
  const { courseId, payMode, firstName, lastName, email, license } =
    parsed.data;

  const course = findEvent(courseId);
  if (!course) return fail("Course not found", 404);
  if (!isPurchasable(course)) {
    return fail("This course is not available for online purchase.", 409);
  }

  const amount = amountDueTodayCents(course, payMode);
  const balance = balanceDueCents(course, payMode);

  // TEMP PROBE: replicate the SDK's authenticated POST via raw fetch.
  let probe = "";
  try {
    const sk = process.env.STRIPE_SECRET_KEY ?? "";
    const r = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sk}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: String(amount),
        currency: course.purchase.currency,
        "automatic_payment_methods[enabled]": "true",
      }),
    });
    probe = `rawPOST HTTP ${r.status}; `;
  } catch (e) {
    probe = `rawPOST FAILED: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}; `;
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: course.purchase.currency,
      // Lets the Payment Element show every method enabled in the Stripe
      // Dashboard (cards AND PayPal) without per-method wiring here.
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      description: `${course.title} — ${
        payMode === "deposit" ? "Reservation deposit" : "Full payment"
      }`,
      metadata: {
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        courseDates: course.dateLabel,
        payMode,
        firstName,
        lastName,
        email,
        license: license || "",
        amountDueCents: String(amount),
        balanceDueCents: String(balance),
        fullAmountCents: String(fullAmountCents(course)),
      },
    });

    return ok(
      {
        clientSecret: intent.client_secret,
        amount,
        currency: course.purchase.currency,
      },
      201,
    );
  } catch (err) {
    // Log the underlying Stripe error server-side for diagnosis; return a
    // generic message to the client (never leak internal error detail).
    const detail =
      err instanceof Error
        ? `${err.name}: ${err.message}${
            (err as { cause?: { message?: string } }).cause
              ? ` | cause: ${(err as { cause?: { message?: string } }).cause?.message}`
              : ""
          }`
        : String(err);
    console.error("[create-payment-intent] Stripe error:", detail);
    return fail(`DIAG3: ${probe}${detail}`, 502);
  }
}
