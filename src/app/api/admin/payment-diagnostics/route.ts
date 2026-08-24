import { cookies } from "next/headers";
import { ok, fail } from "@/lib/api-response";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { getPaymentLog } from "@/lib/payment-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin diagnostics: the payment attempt log as JSON. Same data the Payments
 * tab renders — kept as an endpoint for scripted checks. Strictly read-only
 * against Stripe; it cannot charge, refund, or modify anything.
 */
export async function GET(req: Request): Promise<Response> {
  const cookieStore = await cookies();
  const authed = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authed) return fail("Unauthorized", 401);

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? 100);
  const courseId = url.searchParams.get("courseId");
  const failuresOnly = url.searchParams.get("failuresOnly") === "1";

  try {
    const log = await getPaymentLog(limit);
    if (!log.configured) return fail("Stripe is not configured", 503);

    let attempts = log.attempts;
    if (courseId) attempts = attempts.filter((a) => a.courseId === courseId);
    if (failuresOnly) {
      attempts = attempts.filter((a) => a.outcome !== "succeeded");
    }

    return ok({ counts: log.counts, attempts });
  } catch (err) {
    return fail(
      err instanceof Error ? err.message : "Stripe request failed",
      502,
    );
  }
}
