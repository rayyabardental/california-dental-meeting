import { ok, fail } from "@/lib/api-response";
import { findEvent } from "@/lib/events-data";
import { createCertificate } from "@/lib/certificates";
import { isRedisConfigured } from "@/lib/redis";
import { CertificateSubmissionSchema } from "@/lib/validations/certificate";
import { rateLimit, tooManyRequests, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Guest certificate submission from the QR-code signing page. Stores the
 * signed certificate as "pending"; the signed PDF is emailed after the event
 * concludes (see /api/cron/send-certificates). No payment data is involved.
 */
export async function POST(req: Request): Promise<Response> {
  // Rate limit: shared venue WiFi must not block a cohort. Keyed by IP, fails open so a Redis outage
  // can never block a real customer.
  const rl = await rateLimit("certificates", clientIp(req), 80, 3600);
  if (!rl.allowed) return tooManyRequests(rl.retryAfterSeconds);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request body", 400);
  }

  const parsed = CertificateSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  }

  const course = findEvent(parsed.data.courseId);
  if (!course || !course.certificate) {
    return fail("Certificates are not available for this course.", 404);
  }

  if (!isRedisConfigured()) {
    return fail(
      "We couldn't save your certificate right now. Please notify event staff.",
      503,
    );
  }

  const record = await createCertificate({
    courseId: course.id,
    courseTitle: course.title,
    participantName: parsed.data.participantName,
    licenseNumber: parsed.data.licenseNumber,
    email: parsed.data.email,
    signature: parsed.data.signature,
  });

  if (!record) {
    return fail(
      "We couldn't save your certificate right now. Please notify event staff.",
      500,
    );
  }

  return ok({ certNumber: record.certNumber }, 201);
}
