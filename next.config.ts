import type { NextConfig } from "next";

/**
 * Content-Security-Policy, shipped in REPORT-ONLY mode first.
 *
 * The site loads third-party scripts from Stripe, PayPal and Mapbox, each of
 * which pulls further subresources at runtime. Enforcing a policy without
 * first observing real traffic risks silently breaking checkout, so this is
 * deployed report-only: violations surface in the browser console while
 * nothing is blocked. Promote to `Content-Security-Policy` only after the
 * console is clean across checkout (card + PayPal), the map, and the
 * certificate page.
 *
 * 'unsafe-inline'/'unsafe-eval' are present because Next's hydration inlines
 * bootstrap script and Mapbox GL compiles shaders at runtime; tightening
 * those requires nonce plumbing and is tracked separately.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.paypal.com https://api.mapbox.com",
  "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
  "img-src 'self' data: blob: https://*.stripe.com https://*.paypal.com https://*.mapbox.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://*.stripe.com https://*.paypal.com https://*.mapbox.com https://events.mapbox.com",
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
          { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
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
