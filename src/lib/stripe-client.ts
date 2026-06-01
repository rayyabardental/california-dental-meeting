import { loadStripe, type Stripe } from "@stripe/stripe-js";

/**
 * Browser-side Stripe.js loader (memoized). The publishable key is inlined at
 * build time. Returns `null` when unset so the checkout UI can show a
 * fallback instead of attempting to mount Stripe Elements.
 *
 * Stripe.js loads card fields inside Stripe-hosted iframes, so raw card data
 * (PAN/CVV) goes directly from the browser to Stripe over TLS and never
 * touches our DOM, our state, or our server. This keeps CDM in PCI SAQ A.
 */
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripePromise(): Promise<Stripe | null> | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  if (!stripePromise) stripePromise = loadStripe(key);
  return stripePromise;
}
