import { cookies } from "next/headers";
import { ok, fail } from "@/lib/api-response";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin diagnostics: recent PaymentIntents with their outcome, including the
 * failure reason and decline code for anything that did not succeed.
 *
 * Strictly read-only against Stripe — it cannot create, charge, or refund.
 * Exists to diagnose reported checkout failures with real data rather than
 * guesswork. Returns no card numbers (Stripe never exposes them); at most the
 * brand/last4 already shown on the customer's own receipt.
 */
export async function GET(req: Request): Promise<Response> {
  const cookieStore = await cookies();
  const authed = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authed) return fail("Unauthorized", 401);

  const stripe = getStripe();
  if (!stripe) return fail("Stripe is not configured", 503);

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 25), 100);
  const courseId = url.searchParams.get("courseId");

  try {
    const list = await stripe.paymentIntents.list({ limit });
    const rows = list.data
      .filter((pi) => !courseId || pi.metadata?.courseId === courseId)
      .map((pi) => {
        const err = pi.last_payment_error;
        return {
          id: pi.id,
          created: new Date(pi.created * 1000).toISOString(),
          status: pi.status,
          amount: pi.amount,
          currency: pi.currency,
          courseId: pi.metadata?.courseId ?? null,
          courseTitle: pi.metadata?.courseTitle ?? null,
          email: pi.metadata?.email ?? null,
          payMode: pi.metadata?.payMode ?? null,
          // Why it failed, when it did.
          errorType: err?.type ?? null,
          errorCode: err?.code ?? null,
          declineCode: err?.decline_code ?? null,
          errorMessage: err?.message ?? null,
          cardBrand: err?.payment_method?.card?.brand ?? null,
          cardLast4: err?.payment_method?.card?.last4 ?? null,
          cardCountry: err?.payment_method?.card?.country ?? null,
        };
      });

    const summary = rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});

    return ok({ scanned: list.data.length, summary, rows });
  } catch (err) {
    return fail(
      err instanceof Error ? err.message : "Stripe request failed",
      502,
    );
  }
}
