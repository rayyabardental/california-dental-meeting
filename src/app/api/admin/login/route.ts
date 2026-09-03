import { cookies } from "next/headers";
import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import { rateLimit, tooManyRequests, clientIp } from "@/lib/rate-limit";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/admin-auth";

const LoginSchema = z.object({ password: z.string().min(1) });

export async function POST(req: Request): Promise<Response> {
  // Brute-force guard: the admin area is protected by a single shared
  // password, so unlimited guessing is the main risk to it. Keyed by IP and
  // deliberately generous so a legitimate admin mistyping never gets locked
  // out. Fails open if Redis is unavailable.
  const limited = await rateLimit("admin-login", clientIp(req), 8, 300);
  if (!limited.allowed) return tooManyRequests(limited.retryAfterSeconds);

  if (!isAdminConfigured()) {
    return fail("Admin access is not configured.", 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Password is required.", 422);
  }

  const valid = await verifyAdminPassword(parsed.data.password);
  if (!valid) {
    return fail("Incorrect password.", 401);
  }

  const token = await createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return ok({ ok: true });
}
