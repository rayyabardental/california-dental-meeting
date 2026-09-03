import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import { findEvent } from "@/lib/events-data";
import { isPurchasable, balanceDueCents } from "@/lib/checkout";
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal";
import { CheckoutSchema } from "@/lib/validations/checkout";
import { sendRegistrationConfirmation } from "@/lib/resend";
import { addContactToList } from "@/lib/constant-contact";
import { ensureOrder, orderInputFromCourse } from "@/lib/orders";
import { rateLimit, tooManyRequests, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Registrant details + the approved order id. Registrant fields mirror the
// Stripe flow; they're non-financial (used for the confirmation email/records).
const Schema = CheckoutSchema.extend({ orderId: z.string().min(1) });

/** Capture an approved PayPal order, then trigger the confirmation email. */
export async function POST(req: Request): Promise<Response> {
  // Rate limit: must survive legitimate retries. Keyed by IP, fails open so a Redis outage
  // can never block a real customer.
  const rl = await rateLimit("paypal-capture", clientIp(req), 20, 600);
  if (!rl.allowed) return tooManyRequests(rl.retryAfterSeconds);

  if (!isPayPalConfigured()) {
    return fail("PayPal is not available yet.", 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  }
  const { orderId, courseId, payMode, firstName, lastName, email, license } =
    parsed.data;

  const course = findEvent(courseId);
  if (!course || !isPurchasable(course)) {
    return fail("This course is not available for online purchase.", 409);
  }

  try {
    const capture = await capturePayPalOrder(orderId);
    if (capture.status !== "COMPLETED") {
      return fail(`Payment not completed (status: ${capture.status}).`, 402);
    }

    // Idempotently record the order (for the lookup page). No card data.
    const order = await ensureOrder(
      orderInputFromCourse(course, {
        provider: "paypal",
        providerId: orderId,
        amountPaidCents: capture.amountCents,
        currency: capture.currency,
        payMode,
        balanceDueCents: balanceDueCents(course, payMode),
        firstName,
        lastName,
        email,
      }),
    );

    // Add to the announcements list, tagged by course + send the (optional)
    // branded confirmation email. All fail soft.
    await addContactToList({
      email,
      firstName,
      lastName,
      courseName: course.title,
    });
    await sendRegistrationConfirmation({
      email,
      firstName,
      lastName,
      courseTitle: course.title,
      courseDates: course.dateLabel,
      payMode,
      amountPaidCents: capture.amountCents,
      balanceDueCents: balanceDueCents(course, payMode),
      currency: capture.currency,
    });

    void license; // captured for parity with Stripe metadata; not persisted here
    return ok(
      { status: capture.status, orderId, orderNumber: order?.orderNumber ?? null },
      200,
    );
  } catch (err) {
    console.error("[paypal] request failed:", err);
    console.error(
      "[paypal/capture-order]",
      // Internal PayPal/SDK error text is not surfaced to the browser; it can
      // carry request ids and upstream detail. Logged server-side instead.
      "Payment could not be processed. Please try again.",
    );
    return fail("Could not complete PayPal payment. Please try again.", 502);
  }
}
