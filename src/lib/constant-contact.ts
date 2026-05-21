import { env } from "@/lib/env";
import { isRedisConfigured, redisDel, redisGet, redisSet } from "@/lib/redis";

/**
 * Constant Contact API v3 integration.
 *
 * Constant Contact v3 authenticates with OAuth2 (authorization code flow):
 *   1. A one-time browser authorization yields a refresh token.
 *   2. The refresh token is exchanged for short-lived (8h) access tokens.
 *   3. Refresh tokens are single-use — each refresh returns a new one, so the
 *      latest token is always persisted back to Redis.
 *
 * Every public function fails soft: if the integration is not configured or a
 * network/API call fails, callers receive `false`/`null` and the surrounding
 * form flow is never interrupted.
 */

const AUTH_BASE = "https://authz.constantcontact.com/oauth2/default/v1";
const API_BASE = "https://api.cc.email/v3";
const SCOPE = "contact_data offline_access";

/** Refresh token rotates 5 min before the reported expiry, as a safety margin. */
const ACCESS_TOKEN_SKEW_SECONDS = 300;
const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 28_800; // 8 hours

const REFRESH_KEY = "cc:refresh_token";
const ACCESS_KEY = "cc:access_token";
const LIST_KEY = "cc:list_id";
const STATE_KEY = (state: string): string => `cc:oauth_state:${state}`;

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

interface CachedAccessToken {
  token: string;
  expiresAt: number;
}

export interface ContactInput {
  email: string;
  firstName?: string;
  lastName?: string;
}

/** True when the API credentials and Redis token store are all present. */
export function isConstantContactConfigured(): boolean {
  return Boolean(
    env.CONSTANT_CONTACT_API_KEY &&
      env.CONSTANT_CONTACT_CLIENT_SECRET &&
      isRedisConfigured(),
  );
}

/** True once the one-time OAuth authorization has stored a refresh token. */
export async function isConstantContactConnected(): Promise<boolean> {
  if (!isConstantContactConfigured()) return false;
  return Boolean(await redisGet(REFRESH_KEY));
}

function basicAuthHeader(): string {
  const raw = `${env.CONSTANT_CONTACT_API_KEY}:${env.CONSTANT_CONTACT_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

/* -------------------------------------------------------------------------- */
/* OAuth: authorization                                                       */
/* -------------------------------------------------------------------------- */

export function buildAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: env.CONSTANT_CONTACT_API_KEY ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    state,
    scope: SCOPE,
  });
  return `${AUTH_BASE}/authorize?${params.toString()}`;
}

/** Persist the OAuth `state` -> `redirectUri` pair for CSRF validation. */
export async function saveOAuthState(
  state: string,
  redirectUri: string,
): Promise<void> {
  await redisSet(STATE_KEY(state), redirectUri, 600);
}

/** Validate and consume an OAuth `state`, returning its `redirectUri`. */
export async function consumeOAuthState(
  state: string,
): Promise<string | null> {
  const redirectUri = await redisGet(STATE_KEY(state));
  if (redirectUri) await redisDel(STATE_KEY(state));
  return redirectUri;
}

/* -------------------------------------------------------------------------- */
/* OAuth: token lifecycle                                                     */
/* -------------------------------------------------------------------------- */

async function persistTokens(tokens: TokenResponse): Promise<void> {
  if (tokens.refresh_token) {
    await redisSet(REFRESH_KEY, tokens.refresh_token);
  }
  if (tokens.access_token) {
    const ttl = tokens.expires_in ?? DEFAULT_ACCESS_TOKEN_TTL_SECONDS;
    const cached: CachedAccessToken = {
      token: tokens.access_token,
      expiresAt: Date.now() + (ttl - ACCESS_TOKEN_SKEW_SECONDS) * 1000,
    };
    await redisSet(ACCESS_KEY, JSON.stringify(cached), ttl);
  }
}

/** Exchange a one-time authorization code for refresh + access tokens. */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${AUTH_BASE}/token`, {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(),
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(
        "[constant-contact] code exchange failed",
        res.status,
        await res.text().catch(() => ""),
      );
      return false;
    }
    await persistTokens((await res.json()) as TokenResponse);
    return true;
  } catch (err) {
    console.error("[constant-contact] code exchange error", err);
    return false;
  }
}

async function getAccessToken(): Promise<string | null> {
  // Reuse a cached access token while it is still valid.
  const cachedRaw = await redisGet(ACCESS_KEY);
  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw) as CachedAccessToken;
      if (cached.token && cached.expiresAt > Date.now()) return cached.token;
    } catch {
      /* corrupt cache — fall through to refresh */
    }
  }

  // Otherwise refresh using the stored (single-use) refresh token.
  const refreshToken = await redisGet(REFRESH_KEY);
  if (!refreshToken) {
    console.warn(
      "[constant-contact] no refresh token — run the one-time /api/constant-contact/connect flow",
    );
    return null;
  }

  try {
    const res = await fetch(`${AUTH_BASE}/token`, {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(),
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(
        "[constant-contact] token refresh failed",
        res.status,
        await res.text().catch(() => ""),
      );
      return null;
    }
    const tokens = (await res.json()) as TokenResponse;
    await persistTokens(tokens);
    return tokens.access_token ?? null;
  } catch (err) {
    console.error("[constant-contact] token refresh error", err);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Contact lists                                                              */
/* -------------------------------------------------------------------------- */

async function getOrCreateListId(accessToken: string): Promise<string | null> {
  const cached = await redisGet(LIST_KEY);
  if (cached) return cached;

  const listName = env.CONSTANT_CONTACT_LIST_NAME;

  try {
    const listRes = await fetch(
      `${API_BASE}/contact_lists?include_count=false&limit=1000`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );
    if (listRes.ok) {
      const data = (await listRes.json()) as {
        lists?: { list_id: string; name: string }[];
      };
      const match = data.lists?.find((l) => l.name === listName);
      if (match) {
        await redisSet(LIST_KEY, match.list_id);
        return match.list_id;
      }
    }

    // No list with that name — create it.
    const createRes = await fetch(`${API_BASE}/contact_lists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: listName,
        favorite: false,
        description:
          "Website sign-ups — course applications and enrollment inquiries.",
      }),
      cache: "no-store",
    });
    if (!createRes.ok) {
      console.error(
        "[constant-contact] list creation failed",
        createRes.status,
        await createRes.text().catch(() => ""),
      );
      return null;
    }
    const created = (await createRes.json()) as { list_id: string };
    await redisSet(LIST_KEY, created.list_id);
    return created.list_id;
  } catch (err) {
    console.error("[constant-contact] list lookup error", err);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Add (or update) a contact and place them on the configured list.
 *
 * Uses the `/contacts/sign_up_form` endpoint, which creates or updates a
 * contact by email — no 409 handling needed for repeat submissions. Returns
 * `true` on success; never throws, so a form submission is never blocked.
 */
export async function addContactToList(input: ContactInput): Promise<boolean> {
  if (!isConstantContactConfigured()) {
    console.warn(
      "[constant-contact] skipped — integration not configured (missing API key, secret, or Redis)",
    );
    return false;
  }

  const email = input.email.trim();
  if (!email) return false;

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return false;

    const listId = await getOrCreateListId(accessToken);
    if (!listId) return false;

    const payload: Record<string, unknown> = {
      email_address: email,
      list_memberships: [listId],
    };
    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim();
    if (firstName) payload.first_name = firstName.slice(0, 50);
    if (lastName) payload.last_name = lastName.slice(0, 50);

    const res = await fetch(`${API_BASE}/contacts/sign_up_form`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(
        "[constant-contact] add contact failed",
        res.status,
        await res.text().catch(() => ""),
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("[constant-contact] add contact error", err);
    return false;
  }
}
