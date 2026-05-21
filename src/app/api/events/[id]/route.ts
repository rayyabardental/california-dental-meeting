import { ok, fail } from "@/lib/api-response";
import { findEvent } from "@/lib/events-data";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await ctx.params;
  const event = findEvent(id);
  if (!event) return fail("Event not found", 404);
  return ok(event);
}
