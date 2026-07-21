import { ok, fail } from "@/lib/api-response";
import { env } from "@/lib/env";
import { redisHealth } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily keep-alive for the order database.
 *
 * Upstash archives free-tier databases after a stretch of inactivity. When
 * that happened here, every order write failed silently — three paid
 * registrations were charged by Stripe but never recorded. A once-a-day
 * write/read round trip keeps the database counted as active so it is never
 * archived out from under a live checkout flow.
 *
 * Scheduled by vercel.json. Vercel sends `Authorization: Bearer $CRON_SECRET`
 * on cron invocations; when that variable is set we require it, so the route
 * can't be triggered by anyone else.
 */
export async function GET(req: Request): Promise<Response> {
  if (env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      return fail("Unauthorized", 401);
    }
  }

  const health = await redisHealth();
  if (!health.reachable) {
    // Non-2xx so the failure surfaces in Vercel's cron run history instead of
    // silently "succeeding" while the datastore is down.
    console.error("[keepalive] order storage unreachable:", health.error);
    return fail(`Order storage unreachable: ${health.error ?? "unknown"}`, 503);
  }
  return ok({ storage: "reachable", checkedAt: new Date().toISOString() });
}
