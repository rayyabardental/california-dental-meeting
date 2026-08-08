import { cookies } from "next/headers";
import { ok, fail } from "@/lib/api-response";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { getCertificate } from "@/lib/certificates";
import { findEvent } from "@/lib/events-data";
import { sendCertificateEmail } from "@/lib/certificate-email";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Admin: email one specific certificate immediately, to an address of the
 * admin's choosing — for previewing the real email/PDF, or a one-off resend.
 * Ignores the event-concluded date gate and does NOT change the certificate's
 * status, so the automatic post-event send is unaffected.
 */
export async function POST(req: Request): Promise<Response> {
  const cookieStore = await cookies();
  const authed = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authed) return fail("Unauthorized", 401);

  if (!env.RESEND_API_KEY) {
    return fail(
      "Email isn't configured — add RESEND_API_KEY (and a verified sender) in Vercel, then redeploy.",
      503,
    );
  }

  let body: { certNumber?: string; to?: string };
  try {
    body = (await req.json()) as { certNumber?: string; to?: string };
  } catch {
    return fail("Invalid request body", 400);
  }

  const certNumber = body.certNumber?.trim();
  if (!certNumber) return fail("Missing certificate number", 400);

  const to = body.to?.trim();
  if (to && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return fail("Enter a valid email address.", 400);
  }

  const record = await getCertificate(certNumber);
  if (!record) return fail("Certificate not found", 404);

  const course = findEvent(record.courseId);
  if (!course || !course.certificate) {
    return fail("Course metadata unavailable for this certificate", 409);
  }

  const sent = await sendCertificateEmail(record, course, to);
  if (!sent) {
    return fail(
      "Resend rejected the send — check the sender domain is verified.",
      502,
    );
  }
  return ok({ sent: to ?? record.email });
}
