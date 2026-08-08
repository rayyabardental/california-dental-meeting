import { ok, fail } from "@/lib/api-response";
import { env } from "@/lib/env";
import { sendDueCertificates } from "@/lib/send-certificates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Certificate emails carry a PDF attachment each — give the batch room to run.
export const maxDuration = 60;

/**
 * Daily job: email every pending certificate whose event has concluded.
 * Scheduled by vercel.json. Requires Authorization: Bearer $CRON_SECRET when
 * that variable is set, so only Vercel's scheduler can trigger it.
 */
export async function GET(req: Request): Promise<Response> {
  if (env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${env.CRON_SECRET}`) return fail("Unauthorized", 401);
  }

  const summary = await sendDueCertificates();
  if (!summary.configured) {
    console.warn("[send-certificates] RESEND_API_KEY not set — nothing sent");
  }
  return ok(summary);
}
