import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import { findEvent } from "@/lib/events-data";
import { isPurchasable } from "@/lib/checkout";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal";
import { rateLimit, tooManyRequests, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Schema = z.object({
  courseId: z.string().min(1),
  payMode: z.enum(["full", "deposit"]),
  amountCents: z.number().int().positive().max(100_000_000).optional(),
});

/** Create a PayPal order. Amount is computed server-side from course data. */
export async function POST(req: Request): Promise<Response> {
  // Rate limit: must survive legitimate retries. Keyed by IP, fails open so a Redis outage
  // can never block a real customer.
  const rl = await rateLimit("paypal-create", clientIp(req), 20, 600);
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

  const course = findEvent(parsed.data.courseId);
  if (!course) return fail("Course not found", 404);
  if (!isPurchasable(course)) {
    return fail("This course is not available for online purchase.", 409);
  }

  try {
    const orderId = await createPayPalOrder(
      course,
      parsed.data.payMode,
      parsed.data.amountCents,
    );
    return ok({ orderId }, 201);
  } catch (err) {
    console.error("[paypal] request failed:", err);
    console.error(
      "[paypal/create-order]",
      // Internal PayPal/SDK error text is not surfaced to the browser; it can
      // carry request ids and upstream detail. Logged server-side instead.
      "Payment could not be processed. Please try again.",
    );
    return fail("Could not start PayPal checkout. Please try again.", 502);
  }
}
