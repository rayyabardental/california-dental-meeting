import { cookies } from "next/headers";
import { ok } from "@/lib/api-response";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return ok({ ok: true });
}
