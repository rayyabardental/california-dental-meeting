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
    // Constant Contact API v3 (OAuth2). The API key is the OAuth client id;
    // the client secret is required for the token + refresh exchanges.
    CONSTANT_CONTACT_API_KEY: z.string().min(1).optional(),
    CONSTANT_CONTACT_CLIENT_SECRET: z.string().min(1).optional(),
    CONSTANT_CONTACT_LIST_NAME: z
      .string()
      .min(1)
      .default("CDM Event Announcements"),
  },
  client: {
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
    CONSTANT_CONTACT_API_KEY: process.env.CONSTANT_CONTACT_API_KEY,
    CONSTANT_CONTACT_CLIENT_SECRET: process.env.CONSTANT_CONTACT_CLIENT_SECRET,
    CONSTANT_CONTACT_LIST_NAME: process.env.CONSTANT_CONTACT_LIST_NAME,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
