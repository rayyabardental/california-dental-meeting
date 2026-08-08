import { cookies } from "next/headers";
import { ok, fail } from "@/lib/api-response";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { sendDueCertificates } from "@/lib/send-certificates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Admin: send now, on demand, every pending certificate whose event has
 * concluded — the same date-gated logic the daily cron runs, without waiting
 * for the scheduled time.
 */
export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  const authed = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authed) return fail("Unauthorized", 401);

  const summary = await sendDueCertificates();
  if (!summary.configured) {
    return fail(
      "Email isn't configured — add RESEND_API_KEY (and a verified sender) in Vercel, then redeploy.",
      503,
    );
  }
  return ok(summary);
}
