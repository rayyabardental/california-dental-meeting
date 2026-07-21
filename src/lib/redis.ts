import { env } from "@/lib/env";

/**
 * Minimal Upstash Redis client built on the Upstash REST API.
 *
 * Uses `fetch` directly so the project needs no extra dependency. When the
 * Upstash environment variables are absent every operation degrades to a
 * no-op, allowing dependent features (Constant Contact sync) to fail soft
 * instead of throwing.
 */

// Vercel's Marketplace Upstash integration uses the KV_* names, while a
// direct Upstash setup uses UPSTASH_*. Accept either — the two pairs map to
// the same Upstash REST credentials.
const REST_URL = env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL;
const REST_TOKEN = env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN;

export function isRedisConfigured(): boolean {
  return Boolean(REST_URL && REST_TOKEN);
}

/**
 * Live connectivity check. `isRedisConfigured()` only proves the environment
 * variables exist — this proves the credentials actually work, by performing a
 * real write/read/delete round trip. Returns the underlying failure reason so
 * a broken datastore can't masquerade as "no data yet".
 */
export async function redisHealth(): Promise<{
  configured: boolean;
  reachable: boolean;
  error?: string;
}> {
  if (!REST_URL || !REST_TOKEN) {
    return { configured: false, reachable: false, error: "env vars missing" };
  }
  const probeKey = `health:probe:${Date.now()}`;
  try {
    const res = await fetch(REST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", probeKey, "ok", "EX", 30]),
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) {
      return {
        configured: true,
        reachable: false,
        error: `HTTP ${res.status}: ${text.slice(0, 200)}`,
      };
    }
    const json = JSON.parse(text) as { result?: string; error?: string };
    if (json.error) {
      return { configured: true, reachable: false, error: json.error };
    }
    await command(["DEL", probeKey]);
    return { configured: true, reachable: json.result === "OK" };
  } catch (err) {
    return {
      configured: true,
      reachable: false,
      error: err instanceof Error ? err.message : "request failed",
    };
  }
}

async function command<T>(args: (string | number)[]): Promise<T | null> {
  if (!REST_URL || !REST_TOKEN) return null;
  try {
    const res = await fetch(REST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[redis] command failed", res.status);
      return null;
    }
    const json = (await res.json()) as { result?: T; error?: string };
    if (json.error) {
      console.error("[redis] command error", json.error);
      return null;
    }
    return json.result ?? null;
  } catch (err) {
    console.error("[redis] request error", err);
    return null;
  }
}

export async function redisGet(key: string): Promise<string | null> {
  return command<string>(["GET", key]);
}

/** Batch GET — one round trip for many keys. Missing keys come back null. */
export async function redisMGet(
  keys: string[],
): Promise<(string | null)[] | null> {
  if (keys.length === 0) return [];
  return command<(string | null)[]>(["MGET", ...keys]);
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<boolean> {
  const args: (string | number)[] = ["SET", key, value];
  if (ttlSeconds && ttlSeconds > 0) args.push("EX", ttlSeconds);
  const result = await command<string>(args);
  return result === "OK";
}

export async function redisDel(key: string): Promise<void> {
  await command(["DEL", key]);
}

/** Atomic increment. Returns the new value, or null if Redis is unavailable. */
export async function redisIncr(key: string): Promise<number | null> {
  return command<number>(["INCR", key]);
}

/**
 * SET only if the key does not already exist (atomic claim). Returns true when
 * this caller set the key (won the race), false when it already existed.
 */
export async function redisSetNx(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<boolean> {
  const args: (string | number)[] = ["SET", key, value, "NX"];
  if (ttlSeconds && ttlSeconds > 0) args.push("EX", ttlSeconds);
  const result = await command<string>(args);
  return result === "OK";
}
