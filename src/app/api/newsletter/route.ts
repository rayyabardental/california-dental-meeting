import { ok, fail } from "@/lib/api-response";
import { NewsletterSchema } from "@/lib/validations/event";
import { rateLimit, tooManyRequests, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request): Promise<Response> {
  // Rate limit: blocks list-stuffing. Keyed by IP, fails open so a Redis outage
  // can never block a real customer.
  const rl = await rateLimit("newsletter", clientIp(req), 5, 600);
  if (!rl.allowed) return tooManyRequests(rl.retryAfterSeconds);

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
