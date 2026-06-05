import type Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { sendRegistrationConfirmation } from "@/lib/resend";
import { addContactToList } from "@/lib/constant-contact";
import { findEvent } from "@/lib/events-data";
import { ensureOrder, orderInputFromCourse } from "@/lib/orders";
import type { PayMode } from "@/lib/checkout";

export const runtime = "nodejs";

/**
 * Stripe webhook. Verifies the event signature against the raw request body,
 * then triggers the registration confirmation email on a successful payment.
 *
 * Registrant records live in Stripe (PaymentIntent metadata + the Dashboard);
 * this handler does not persist anything, and never touches card data.
 */
export async function POST(req: Request): Promise<Response> {
  const stripe = getStripe();
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Webhook not configured", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  // Raw body is required for signature verification — do NOT parse as JSON first.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const m = pi.metadata ?? {};
    if (m.email && m.courseTitle) {
      const payMode = (m.payMode as PayMode) ?? "full";
      const course = m.courseId ? findEvent(m.courseId) : undefined;

      // Idempotently record the order (for the lookup page). No card data.
      if (course) {
        await ensureOrder(
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
      }

      // Add the registrant to the announcements list, tagged by course, and
      // send the (optional) branded confirmation email. All fail soft.
      await addContactToList({
        email: m.email,
        firstName: m.firstName ?? "",
        lastName: m.lastName ?? "",
        courseName: m.courseTitle,
      });
      await sendRegistrationConfirmation({
        email: m.email,
        firstName: m.firstName ?? "",
        lastName: m.lastName ?? "",
        courseTitle: m.courseTitle,
        courseDates: m.courseDates ?? "",
        payMode: (m.payMode as PayMode) ?? "full",
        amountPaidCents: pi.amount_received || pi.amount,
        balanceDueCents: Number(m.balanceDueCents ?? "0"),
        currency: pi.currency,
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
