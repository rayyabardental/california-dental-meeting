import { ok, fail } from "@/lib/api-response";
import { addContactToList } from "@/lib/constant-contact";
import { ContactSchema } from "@/lib/validations/event";

/** Split a single free-text name field into first / last name parts. */
function splitName(fullName: string): {
  firstName: string;
  lastName?: string;
} {
  const trimmed = fullName.trim();
  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace === -1) return { firstName: trimmed };
  return {
    firstName: trimmed.slice(0, firstSpace),
    lastName: trimmed.slice(firstSpace + 1).trim() || undefined,
  };
}

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

  // Sync the enquirer to the Constant Contact mailing list. Fails soft —
  // a sync error must never block a successful contact submission.
  const { firstName, lastName } = splitName(parsed.data.name);
  await addContactToList({ email: parsed.data.email, firstName, lastName });

  // Wire to Resend transactional email once RESEND_API_KEY + CONTACT_TO_EMAIL set.
  return ok({ ok: true as const }, 201);
}
