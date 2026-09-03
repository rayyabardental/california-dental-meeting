import { isRedisConfigured, redisIncr, redisExpire } from "@/lib/redis";

/**
 * Fixed-window rate limiter.
 *
 * Uses Redis when configured so the counter is shared across serverless
 * instances (a per-instance counter is trivially bypassed on Vercel, where
 * each cold start gets fresh memory). Falls back to an in-process map so
 * local dev and a Redis outage still get *some* protection.
 *
 * Fails OPEN: if Redis errors we allow the request rather than block real
 * customers mid-checkout. The limiter is a spam/brute-force speed bump, not
 * an authorization control.
 */
export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const memory = new Map<string, { count: number; resetAt: number }>();

/** Best-effort client IP from the proxy headers Vercel sets. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

function memoryLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }
  entry.count += 1;
  const retry = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  return entry.count > limit
    ? { allowed: false, remaining: 0, retryAfterSeconds: retry }
    : { allowed: true, remaining: limit - entry.count, retryAfterSeconds: 0 };
}

export async function rateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  // Bucket the window so the key rolls over on its own via TTL.
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `rl:${bucket}:${identifier}:${window}`;

  if (!isRedisConfigured()) return memoryLimit(key, limit, windowSeconds);

  try {
    const count = await redisIncr(key);
    if (count === null) return memoryLimit(key, limit, windowSeconds);
    // Set the TTL once, on the first hit of this window.
    if (count === 1) await redisExpire(key, windowSeconds);
    if (count > limit) {
      return { allowed: false, remaining: 0, retryAfterSeconds: windowSeconds };
    }
    return { allowed: true, remaining: limit - count, retryAfterSeconds: 0 };
  } catch {
    return memoryLimit(key, limit, windowSeconds);
  }
}

/** 429 response with the standard Retry-After header. */
export function tooManyRequests(retryAfterSeconds: number): Response {
  return new Response(
    JSON.stringify({
      data: null,
      error: "Too many attempts. Please wait a moment and try again.",
      status: 429,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.max(1, retryAfterSeconds)),
      },
    },
  );
}
