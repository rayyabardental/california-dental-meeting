import { cookies } from "next/headers";
import { ok, fail } from "@/lib/api-response";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { redisHealth } from "@/lib/redis";
import { listOrders } from "@/lib/orders";
import {
  addContactToList,
  isConstantContactConfigured,
  isConstantContactConnected,
} from "@/lib/constant-contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Push every registrant on the roster into Constant Contact.
 *
 * Registrants who paid while the integration was disconnected were never
 * synced — `addContactToList()` fails soft so a mailing-list outage can never
 * block a payment, which means those contacts were silently skipped. This
 * replays them.
 *
 * Safe to re-run: Constant Contact's sign_up_form endpoint upserts by email
 * address, so an already-present contact is updated rather than duplicated.
 */
export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  const authed = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authed) return fail("Unauthorized", 401);

  if (!isConstantContactConfigured()) {
    return fail("Constant Contact is not configured", 503);
  }
  if (!(await isConstantContactConnected())) {
    return fail(
      "Constant Contact is not connected — open /api/constant-contact/connect and authorize first",
      503,
    );
  }
  const storage = await redisHealth();
  if (!storage.reachable) {
    return fail(
      `Order storage unreachable: ${storage.error ?? "unknown"}`,
      503,
    );
  }

  const orders = await listOrders();
  if (orders.length === 0) {
    return ok({ total: 0, synced: 0, failed: [] as string[] });
  }

  // De-duplicate by email + course so a repeat buyer isn't pushed twice for
  // the same course in one run.
  const seen = new Set<string>();
  const synced: string[] = [];
  const failed: string[] = [];

  for (const order of orders) {
    const email = order.email?.trim();
    if (!email) continue;
    const key = `${email.toLowerCase()}::${order.courseTitle}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const okAdd = await addContactToList({
      email,
      firstName: order.firstName,
      lastName: order.lastName,
      courseName: order.courseTitle,
    });
    if (okAdd) synced.push(email);
    else failed.push(email);
  }

  return ok({
    total: seen.size,
    synced: synced.length,
    syncedEmails: synced,
    failed,
  });
}
