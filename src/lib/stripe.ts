import Stripe from "stripe";
import { env } from "@/lib/env";

/**
 * Server-side Stripe client singleton. Returns `null` when no secret key is
 * configured so callers can degrade gracefully (checkout shows a "coming
 * soon" state) instead of throwing at build or request time.
 *
 * The API version is intentionally omitted so the installed SDK uses the
 * version its types were generated against.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  if (!client) {
    client = new Stripe(env.STRIPE_SECRET_KEY, {
      // Use the Fetch-based HTTP client, passing the platform `fetch`
      // EXPLICITLY. On Vercel's serverless runtime the default Node `https`
      // agent fails to reach api.stripe.com (StripeConnectionError), and
      // createFetchHttpClient() with no argument doesn't pick up the global
      // fetch here — so we hand it in directly.
      httpClient: Stripe.createFetchHttpClient(fetch),
      appInfo: { name: "California Dental Meeting" },
    });
  }
  return client;
}

/** True when both halves of the Stripe integration are present. */
export function isStripeConfigured(): boolean {
  return Boolean(
    env.STRIPE_SECRET_KEY && env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
}
