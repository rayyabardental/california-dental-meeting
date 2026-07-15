import { cookies } from "next/headers";
import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  isAdminConfigured,
  verifyAdminPassword,
} from "@/lib/admin-auth";

const LoginSchema = z.object({ password: z.string().min(1) });

export async function POST(req: Request): Promise<Response> {
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
