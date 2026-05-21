import { ok, fail } from "@/lib/api-response";
import { findEvent } from "@/lib/events-data";
import { RegistrationSchema } from "@/lib/validations/event";

export async function POST(req: Request): Promise<Response> {
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

  // Persistence stub — wire to Prisma + Resend confirmation when DB is configured.
  const id = `reg_${crypto.randomUUID()}`;
  return ok({ id, eventId: event.id, eventTitle: event.title }, 201);
}
