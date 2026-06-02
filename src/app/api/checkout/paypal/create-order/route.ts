import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import { findEvent } from "@/lib/events-data";
import { isPurchasable } from "@/lib/checkout";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal";

export const runtime = "nodejs";

const Schema = z.object({
  courseId: z.string().min(1),
  payMode: z.enum(["full", "deposit"]),
});

/** Create a PayPal order. Amount is computed server-side from course data. */
export async function POST(req: Request): Promise<Response> {
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
    const orderId = await createPayPalOrder(course, parsed.data.payMode);
    return ok({ orderId }, 201);
  } catch (err) {
    console.error(
      "[paypal/create-order]",
      err instanceof Error ? err.message : String(err),
    );
    return fail("Could not start PayPal checkout. Please try again.", 502);
  }
}
