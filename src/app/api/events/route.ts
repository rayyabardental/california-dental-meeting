import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { EVENTS } from "@/lib/events-data";
import { EventQuerySchema } from "@/lib/validations/event";

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const parsed = EventQuerySchema.safeParse({
    region: searchParams.get("region") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid query", 400);
  }

  const { region, from, to } = parsed.data;
  const fromTs = from ? Date.parse(from) : null;
  const toTs = to ? Date.parse(to) : null;

  const filtered = EVENTS.filter((e) => {
    if (region && e.type !== region) return false;
    const ts = Date.parse(e.date);
    if (fromTs && ts < fromTs) return false;
    if (toTs && ts > toTs) return false;
    return true;
  });

  return ok({ events: filtered, count: filtered.length });
}
