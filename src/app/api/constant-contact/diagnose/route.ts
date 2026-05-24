import { ok } from "@/lib/api-response";
import { env } from "@/lib/env";
import { redisGet } from "@/lib/redis";

export const dynamic = "force-dynamic";

/**
 * Temporary diagnostic endpoint. Gated by the API key (semi-public OAuth
 * client id) so only deployers with access to env vars can call it. Decodes
 * the JWT, reports its scopes, and probes two API endpoints so we can see
 * exactly why list-management calls are 401'ing.
 *
 * Remove once the integration is confirmed healthy.
 */

interface CachedAccessToken {
  token: string;
  expiresAt: number;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2 || !parts[1]) return null;
  try {
    const raw = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (raw.length % 4)) % 4;
    const padded = raw + "=".repeat(padding);
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

async function probe(
  url: string,
  accessToken: string,
): Promise<{ status: number; body: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const body = await res.text();
    return { status: res.status, body: body.slice(0, 500) };
  } catch (err) {
    return { status: 0, body: String(err) };
  }
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (url.searchParams.get("key") !== env.CONSTANT_CONTACT_API_KEY) {
    return new Response("Forbidden", { status: 403 });
  }

  const cachedRaw = await redisGet("cc:access_token");
  if (!cachedRaw) return ok({ stage: "no-access-token-cached" });

  let access: string;
  try {
    access = (JSON.parse(cachedRaw) as CachedAccessToken).token;
  } catch {
    return ok({ stage: "cache-parse-failed" });
  }
  if (!access) return ok({ stage: "empty-access-token" });

  const jwt = decodeJwtPayload(access);
  const accountSummary = await probe(
    "https://api.cc.email/v3/account/summary",
    access,
  );
  const contactLists = await probe(
    "https://api.cc.email/v3/contact_lists?include_count=false&limit=1",
    access,
  );

  return ok({
    tokenPreview: `${access.slice(0, 16)}…${access.slice(-8)}`,
    tokenLength: access.length,
    jwt: jwt
      ? {
          scp: jwt.scp,
          aud: jwt.aud,
          iss: jwt.iss,
          exp: jwt.exp,
          sub: typeof jwt.sub === "string" ? `${jwt.sub.slice(0, 6)}…` : jwt.sub,
        }
      : null,
    probes: { accountSummary, contactLists },
  });
}
