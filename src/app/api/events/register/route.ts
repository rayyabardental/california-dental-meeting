import { ok, fail } from "@/lib/api-response";
import { addContactToList } from "@/lib/constant-contact";
import { findEvent } from "@/lib/events-data";
import { RegistrationSchema } from "@/lib/validations/event";
import { rateLimit, tooManyRequests, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request): Promise<Response> {
  // Rate limit: front-desk staff may register several people. Keyed by IP, fails open so a Redis outage
  // can never block a real customer.
  const rl = await rateLimit("register", clientIp(req), 15, 600);
  if (!rl.allowed) return tooManyRequests(rl.retryAfterSeconds);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = RegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  }

  const event = findEvent(parsed.data.eventId);
  if (!event) return fail("Event not found", 404);
  if (event.spotsRemaining <= 0) {
    return fail("Event is full — join the waitlist", 409);
  }

  // Sync the applicant to the Constant Contact mailing list. Fails soft —
  // a sync error must never block a successful registration.
  await addContactToList({
    email: parsed.data.email,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
  });

  // Persistence stub — wire to Prisma + Resend confirmation when DB is configured.
  const id = `reg_${crypto.randomUUID()}`;
  return ok({ id, eventId: event.id, eventTitle: event.title }, 201);
}
