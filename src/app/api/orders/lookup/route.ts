import { ok, fail } from "@/lib/api-response";
import { getOrder, publicOrderView } from "@/lib/orders";

export const runtime = "nodejs";

/** Public order lookup by order number — no account, no PII returned. */
export async function GET(req: Request): Promise<Response> {
  const order = (new URL(req.url).searchParams.get("order") ?? "").trim();
  if (!order) return fail("Enter an order number.", 400);

  const record = await getOrder(order);
  if (!record) {
    return fail(
      "We couldn't find an order with that number. Please check it and try again.",
      404,
    );
  }
  return ok(publicOrderView(record));
}
