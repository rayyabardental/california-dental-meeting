import { ok, fail } from "@/lib/api-response";
import { ContactSchema } from "@/lib/validations/event";

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  }

  // Wire to Resend transactional email once RESEND_API_KEY + CONTACT_TO_EMAIL set.
  return ok({ ok: true as const }, 201);
}
