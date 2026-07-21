import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().url().optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    CONTACT_TO_EMAIL: z.string().email().optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    // Vercel's Marketplace Upstash integration ships these under the legacy
    // KV_* prefix. Either pair works — redis.ts prefers UPSTASH_*, falls back.
    KV_REST_API_URL: z.string().url().optional(),
    KV_REST_API_TOKEN: z.string().min(1).optional(),
    // Set automatically by Vercel for scheduled (cron) invocations. When
    // present, the keep-alive route requires it so only Vercel can trigger it.
    CRON_SECRET: z.string().min(1).optional(),
    // Constant Contact API v3 (OAuth2). The API key is the OAuth client id;
    // the client secret is required for the token + refresh exchanges.
    CONSTANT_CONTACT_API_KEY: z.string().min(1).optional(),
    CONSTANT_CONTACT_CLIENT_SECRET: z.string().min(1).optional(),
    CONSTANT_CONTACT_LIST_NAME: z
      .string()
      .min(1)
      .default("CDM Event Announcements"),
    // Stripe (server side). Secret key signs PaymentIntent creation; the
    // webhook secret verifies inbound event signatures. Both optional so the
    // app builds and runs without payments configured — checkout degrades to
    // a "coming soon" state until these are set.
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    // From-address for the registration confirmation email (must be a
    // Resend-verified domain in production). Falls back to Resend's sandbox.
    REGISTRATION_FROM_EMAIL: z
      .string()
      .min(1)
      .default("California Dental Meeting <onboarding@resend.dev>"),
    // PayPal (server side). Client secret signs the OAuth token exchange used
    // to create/capture orders. Environment toggles sandbox vs live hosts.
    PAYPAL_CLIENT_SECRET: z.string().min(1).optional(),
    PAYPAL_ENVIRONMENT: z.enum(["sandbox", "live"]).default("sandbox"),
    // Shared password gating /admin — the registrant roster. Unset disables
    // the admin area entirely (every login attempt is rejected).
    ADMIN_PASSWORD: z.string().min(8).optional(),
  },
  client: {
    // Stripe publishable key — safe to expose; used by Stripe.js in the
    // browser to tokenize card data directly to Stripe (never our server).
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    // PayPal client id — public; used by the PayPal JS SDK in the browser
    // and as the server-side OAuth basic-auth username.
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.string().optional(),
    // Optional explicit override. When unset, the app derives its URL from
    // Vercel's injected domain via getSiteUrl() in src/lib/site-url.ts.
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
    CONSTANT_CONTACT_API_KEY: process.env.CONSTANT_CONTACT_API_KEY,
    CONSTANT_CONTACT_CLIENT_SECRET: process.env.CONSTANT_CONTACT_CLIENT_SECRET,
    CONSTANT_CONTACT_LIST_NAME: process.env.CONSTANT_CONTACT_LIST_NAME,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    REGISTRATION_FROM_EMAIL: process.env.REGISTRATION_FROM_EMAIL,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    PAYPAL_ENVIRONMENT: process.env.PAYPAL_ENVIRONMENT,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
