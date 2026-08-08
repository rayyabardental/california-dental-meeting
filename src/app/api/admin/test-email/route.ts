import { cookies } from "next/headers";
import { Resend } from "resend";
import { ok, fail } from "@/lib/api-response";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin: send a one-off test email to confirm Resend is configured and the
 * sender domain is verified. Returns Resend's actual error verbatim (e.g. a
 * domain-not-verified message) so setup problems are diagnosable.
 */
export async function POST(req: Request): Promise<Response> {
  const cookieStore = await cookies();
  const authed = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authed) return fail("Unauthorized", 401);

  if (!env.RESEND_API_KEY) {
    return fail("RESEND_API_KEY is not set in this environment.", 503);
  }

  let to: string | undefined;
  try {
    ({ to } = (await req.json()) as { to?: string });
  } catch {
    return fail("Invalid request body", 400);
  }
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
    return fail("Enter a valid email address to send the test to.", 400);
  }

  const resend = new Resend(env.RESEND_API_KEY);
  try {
    const { data, error } = await resend.emails.send({
      from: env.REGISTRATION_FROM_EMAIL,
      to: to.trim(),
      subject: "California Dental Meeting — test email",
      html: `<div style="font-family:Arial,sans-serif;color:#0d2340">
        <h2 style="color:#0d2340">Email is working ✅</h2>
        <p>This is a test from your California Dental Meeting admin. If you received
        it, certificate and registration emails will send correctly.</p>
        <p style="color:#5a6a82;font-size:13px">Sent from ${env.REGISTRATION_FROM_EMAIL}</p>
      </div>`,
    });
    if (error) {
      return fail(`Resend rejected the send: ${error.message}`, 502);
    }
    return ok({ id: data?.id ?? null, from: env.REGISTRATION_FROM_EMAIL, to: to.trim() });
  } catch (err) {
    return fail(
      err instanceof Error ? err.message : "Failed to send test email.",
      502,
    );
  }
}
