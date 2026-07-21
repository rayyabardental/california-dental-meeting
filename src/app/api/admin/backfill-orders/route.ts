import { cookies } from "next/headers";
import { ok, fail } from "@/lib/api-response";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { getStripe } from "@/lib/stripe";
import { isRedisConfigured } from "@/lib/redis";
import { findEvent } from "@/lib/events-data";
import {
  ensureOrder,
  getOrderByProvider,
  orderInputFromCourse,
} from "@/lib/orders";
import type { PayMode } from "@/lib/checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recovery tool: rebuild missing order records from Stripe.
 *
 * Orders are normally written by the webhook (and, as a fallback, by the
 * confirmation page). If neither ran — e.g. the live-mode webhook endpoint
 * was never created, so `payment_intent.succeeded` never reached us — the
 * payment still succeeded in Stripe but no order/roster entry exists.
 *
 * This walks succeeded PaymentIntents and calls `ensureOrder()` for each one,
 * which is idempotent: an already-recorded payment is returned unchanged and
 * never gets a second order number. Read-only against Stripe — it cannot
 * charge, refund, or modify anything.
 */
export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  const authed = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authed) return fail("Unauthorized", 401);

  const stripe = getStripe();
  if (!stripe) return fail("Stripe is not configured", 503);
  if (!isRedisConfigured()) return fail("Order storage is not configured", 503);

  const created: string[] = [];
  const existing: string[] = [];
  const skipped: Array<{ id: string; reason: string }> = [];
  let scanned = 0;

  try {
    // Walk every PaymentIntent (newest first), up to a sane ceiling.
    for await (const pi of stripe.paymentIntents.list({ limit: 100 })) {
      scanned++;
      if (scanned > 500) break;
      if (pi.status !== "succeeded") continue;

      const m = pi.metadata ?? {};
      const course = m.courseId ? findEvent(m.courseId) : undefined;
      if (!course) {
        skipped.push({ id: pi.id, reason: "no matching course in metadata" });
        continue;
      }
      if (!m.email) {
        skipped.push({ id: pi.id, reason: "no email in metadata" });
        continue;
      }

      const already = await getOrderByProvider("stripe", pi.id);
      if (already) {
        existing.push(already.orderNumber);
        continue;
      }

      const rec = await ensureOrder(
        orderInputFromCourse(course, {
          provider: "stripe",
          providerId: pi.id,
          amountPaidCents: pi.amount_received || pi.amount,
          currency: pi.currency,
          payMode: (m.payMode as PayMode) ?? "full",
          balanceDueCents: Number(m.balanceDueCents ?? "0"),
          firstName: m.firstName ?? "",
          lastName: m.lastName ?? "",
          email: m.email,
        }),
      );
      if (rec) created.push(`${rec.orderNumber} (${rec.email})`);
      else skipped.push({ id: pi.id, reason: "order write failed" });
    }
  } catch (err) {
    return fail(
      err instanceof Error ? err.message : "Stripe request failed",
      502,
    );
  }

  return ok({
    scanned,
    createdCount: created.length,
    created,
    alreadyRecorded: existing.length,
    skipped,
  });
}
