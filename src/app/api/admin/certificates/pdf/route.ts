import { cookies } from "next/headers";
import { fail } from "@/lib/api-response";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { getCertificate } from "@/lib/certificates";
import { findEvent } from "@/lib/events-data";
import { buildCertificatePdf } from "@/lib/certificate-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin: download the signed PDF for a single certificate, for recordkeeping. */
export async function GET(req: Request): Promise<Response> {
  const cookieStore = await cookies();
  const authed = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authed) return fail("Unauthorized", 401);

  const certNumber = new URL(req.url).searchParams.get("cert")?.trim();
  if (!certNumber) return fail("Missing certificate number", 400);

  const record = await getCertificate(certNumber);
  if (!record) return fail("Certificate not found", 404);

  const course = findEvent(record.courseId);
  if (!course || !course.certificate) {
    return fail("Course metadata unavailable for this certificate", 409);
  }

  const pdf = await buildCertificatePdf(record, course);
  return new Response(Buffer.from(pdf), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="CDM-Certificate-${record.certNumber}.pdf"`,
      "cache-control": "no-store",
    },
  });
}
