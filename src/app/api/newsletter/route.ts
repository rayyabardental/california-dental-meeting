import { ok, fail } from "@/lib/api-response";
import { NewsletterSchema } from "@/lib/validations/event";

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = NewsletterSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid email", 422);
  }

  // Wire to Resend / Mailchimp once RESEND_API_KEY is configured.
  // Intentional stub returning success to keep the UX working in dev.
  return ok({ ok: true as const }, 201);
}
