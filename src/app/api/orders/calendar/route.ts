import { getOrder, buildIcs } from "@/lib/orders";

export const runtime = "nodejs";

/** Returns an .ics calendar file for the order's course (Google/Apple/Outlook). */
export async function GET(req: Request): Promise<Response> {
  const order = (new URL(req.url).searchParams.get("order") ?? "").trim();
  const record = order ? await getOrder(order) : null;
  if (!record) return new Response("Order not found", { status: 404 });

  return new Response(buildIcs(record), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="cdm-${record.orderNumber}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
