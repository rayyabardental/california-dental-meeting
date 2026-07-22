import { cookies } from "next/headers";
import { ok, fail } from "@/lib/api-response";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { redisHealth, redisConfigSource } from "@/lib/redis";
import { env } from "@/lib/env";
import {
  isConstantContactConfigured,
  isConstantContactConnected,
} from "@/lib/constant-contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin diagnostics — reports whether each integration the registration flow
 * depends on is actually working. Never returns secret values, only booleans,
 * key prefixes, and error strings.
 */
export async function GET(): Promise<Response> {
  const cookieStore = await cookies();
  const authed = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authed) return fail("Unauthorized", 401);

  const redis = { ...(await redisHealth()), ...redisConfigSource() };

  const secretKey = env.STRIPE_SECRET_KEY ?? "";
  const stripe = {
    configured: Boolean(secretKey),
    mode: secretKey.startsWith("sk_live")
      ? "live"
      : secretKey.startsWith("sk_test")
        ? "test"
        : "unknown",
    webhookSecretPresent: Boolean(env.STRIPE_WEBHOOK_SECRET),
  };

  const ccConfigured = isConstantContactConfigured();
  const constantContact = {
    configured: ccConfigured,
    connected: ccConfigured ? await isConstantContactConnected() : false,
    // Public OAuth parameter, not a secret. Present here so a missing env var
    // can be told apart from an undeployed build when the flow rejects a URI.
    redirectUriOverride: env.CONSTANT_CONTACT_REDIRECT_URI ?? null,
  };

  return ok({ redis, stripe, constantContact });
}
