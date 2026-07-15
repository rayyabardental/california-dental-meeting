import { env } from "@/lib/env";

/**
 * Minimal signed-session auth for the /admin roster — a single shared
 * password (env.ADMIN_PASSWORD), no user accounts. On successful login the
 * server issues an httpOnly cookie holding `${expiresAt}.${signature}`,
 * where signature = HMAC-SHA256(ADMIN_PASSWORD, expiresAt). Nobody without
 * the password can forge a valid signature, and the cookie itself never
 * contains the password.
 */

export const ADMIN_SESSION_COOKIE = "cdm_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

async function hmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isAdminConfigured(): boolean {
  return Boolean(env.ADMIN_PASSWORD);
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!env.ADMIN_PASSWORD) return false;
  // Compare HMAC digests (fixed length) rather than the raw strings so the
  // comparison itself doesn't leak password length via early-exit timing.
  const [a, b] = await Promise.all([
    hmac("cdm-admin-check", password),
    hmac("cdm-admin-check", env.ADMIN_PASSWORD),
  ]);
  return timingSafeEqual(a, b);
}

export async function createAdminSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signature = await hmac(env.ADMIN_PASSWORD ?? "", String(expiresAt));
  return `${expiresAt}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token || !env.ADMIN_PASSWORD) return false;
  const [expiresAtRaw, signature] = token.split(".");
  const expiresAt = Number(expiresAtRaw);
  if (!expiresAtRaw || !signature || Number.isNaN(expiresAt)) return false;
  if (Date.now() > expiresAt) return false;
  const expected = await hmac(env.ADMIN_PASSWORD, expiresAtRaw);
  return timingSafeEqual(signature, expected);
}

export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
