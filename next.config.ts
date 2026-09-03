import type { NextConfig } from "next";

/**
 * Content-Security-Policy — ENFORCING.
 *
 * Staged: shipped report-only first and verified against real traffic
 * (checkout mounting Stripe Elements + the PayPal SDK produced zero
 * violations) before promotion. If a third party is added later, put the
 * policy back to `Content-Security-Policy-Report-Only`, confirm the console
 * is clean, then re-enforce.
 *
 * 'unsafe-inline'/'unsafe-eval' are present because Next inlines its
 * hydration bootstrap and Mapbox GL compiles shaders at runtime; removing
 * them requires nonce plumbing and is tracked separately.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.paypal.com https://*.paypalobjects.com https://api.mapbox.com",
  "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
  "img-src 'self' data: blob: https://*.stripe.com https://*.paypal.com https://*.paypalobjects.com https://*.mapbox.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://*.stripe.com https://*.paypal.com https://*.paypalobjects.com https://*.mapbox.com https://events.mapbox.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://*.paypal.com",
  "media-src 'self'",
  "worker-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
  // Keep the Stripe SDK out of the server bundle. Bundling it (Turbopack)
  // breaks its HTTP layer at runtime on Vercel (StripeConnectionError even
  // though raw fetch to api.stripe.com works); loading it as a real Node
  // module fixes outbound requests.
  serverExternalPackages: ["stripe"],
  images: {
    // Only hosts actually referenced by the app. An unused entry lets the
    // built-in image optimizer be used as an open fetch/resize proxy for
    // that host, so the list is kept empty until a remote source is needed.
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stop MIME sniffing turning a non-script response into script.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Clickjacking protection (frame-ancestors above covers modern
          // browsers; this covers older ones).
          { key: "X-Frame-Options", value: "DENY" },
          // Don't leak full URLs (which can carry order numbers) cross-origin.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Drop access to device APIs the site never uses.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
      {
        // Admin and API responses must never be cached by a shared cache.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
