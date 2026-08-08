import { cookies } from "next/headers";
import { ok, fail } from "@/lib/api-response";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { deletePendingCertificate } from "@/lib/certificates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin: delete a not-yet-issued (pending) certificate — for removing test or
 * erroneous entries. Issued certificates are retained and cannot be deleted.
 */
export async function POST(req: Request): Promise<Response> {
  const cookieStore = await cookies();
  const authed = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authed) return fail("Unauthorized", 401);

  let body: { certNumber?: string };
  try {
    body = (await req.json()) as { certNumber?: string };
  } catch {
    return fail("Invalid request body", 400);
  }
  const certNumber = body.certNumber?.trim();
  if (!certNumber) return fail("Missing certificate number", 400);

  const result = await deletePendingCertificate(certNumber);
  if (result.ok) return ok({ deleted: certNumber });

  if (result.reason === "already_sent") {
    return fail(
      "Issued certificates are retained for recordkeeping and can't be deleted.",
      409,
    );
  }
  if (result.reason === "not_found") return fail("Certificate not found", 404);
  return fail("Certificate storage is unavailable", 503);
}
