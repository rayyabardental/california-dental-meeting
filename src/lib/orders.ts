import {
  isRedisConfigured,
  redisGet,
  redisMGet,
  redisSet,
  redisIncr,
  redisSetNx,
} from "@/lib/redis";
import { formatMoney, type PayMode } from "@/lib/checkout";
import type { Course } from "@/lib/events-data";

/**
 * Order records — the system of record for the order-lookup page.
 *
 * Stored in Redis (Upstash), keyed by a human-friendly order number. Contains
 * ONLY order metadata: NO card numbers, CVV, or any payment instrument data —
 * those live exclusively with Stripe/PayPal. We persist just enough to look up
 * and re-confirm a purchase by order number, with no account required.
 */
export type OrderProvider = "stripe" | "paypal";

export type OrderRecord = {
  orderNumber: string;
  provider: OrderProvider;
  providerId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  dateLabel: string;
  /** ISO datetime of the course start (used to build the calendar file). */
  startDate: string;
  endDate?: string;
  city: string;
  country: string;
  venue: string;
  ceCredits: number;
  amountPaidCents: number;
  currency: string;
  payMode: PayMode;
  balanceDueCents: number;
  firstName: string;
  lastName: string;
  email: string;
  purchaseDate: string;
  status: "confirmed";
};

export type NewOrderInput = Omit<
  OrderRecord,
  "orderNumber" | "purchaseDate" | "status"
>;

const COUNTER_KEY = "orders:counter";
const ORDER_START = 100000;
const orderKey = (n: string): string => `order:${n.trim().toUpperCase()}`;
const provKey = (p: OrderProvider, id: string): string => `order:prov:${p}:${id}`;

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

/** Build the order input from a course + the payment outcome. */
export function orderInputFromCourse(
  course: Course,
  payment: {
    provider: OrderProvider;
    providerId: string;
    amountPaidCents: number;
    currency: string;
    payMode: PayMode;
    balanceDueCents: number;
    firstName: string;
    lastName: string;
    email: string;
  },
): NewOrderInput {
  return {
    provider: payment.provider,
    providerId: payment.providerId,
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    dateLabel: course.dateLabel,
    startDate: course.date,
    endDate: course.endDate,
    city: course.city,
    country: course.country,
    venue: course.venue,
    ceCredits: course.ceCredits,
    amountPaidCents: payment.amountPaidCents,
    currency: payment.currency,
    payMode: payment.payMode,
    balanceDueCents: payment.balanceDueCents,
    firstName: payment.firstName,
    lastName: payment.lastName,
    email: payment.email,
  };
}

export async function getOrder(orderNumber: string): Promise<OrderRecord | null> {
  if (!isRedisConfigured() || !orderNumber.trim()) return null;
  const raw = await redisGet(orderKey(orderNumber));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OrderRecord;
  } catch {
    return null;
  }
}

export async function getOrderByProvider(
  provider: OrderProvider,
  providerId: string,
): Promise<OrderRecord | null> {
  if (!isRedisConfigured()) return null;
  const num = await redisGet(provKey(provider, providerId));
  if (!num || num === "PENDING") return null;
  return getOrder(num);
}

/**
 * Idempotently create (or fetch) the order for a completed payment. Safe to
 * call from both the success page and the webhook/capture route — a single
 * order number is assigned per payment via an atomic SET-NX claim.
 */
export async function ensureOrder(
  input: NewOrderInput,
): Promise<OrderRecord | null> {
  if (!isRedisConfigured()) return null;
  const pKey = provKey(input.provider, input.providerId);

  const existing = await redisGet(pKey);
  if (existing && existing !== "PENDING") return getOrder(existing);

  // Win the right to create this order exactly once.
  const claimed = await redisSetNx(pKey, "PENDING", 600);
  if (claimed) {
    const n = await redisIncr(COUNTER_KEY);
    const orderNumber = `CDM-${(n ?? 0) + ORDER_START}`;
    const record: OrderRecord = {
      ...input,
      orderNumber,
      purchaseDate: new Date().toISOString(),
      status: "confirmed",
    };
    await redisSet(orderKey(orderNumber), JSON.stringify(record));
    await redisSet(pKey, orderNumber);
    return record;
  }

  // Another invocation is creating it — poll briefly for the result.
  for (let i = 0; i < 8; i++) {
    await sleep(250);
    const v = await redisGet(pKey);
    if (v && v !== "PENDING") return getOrder(v);
  }
  return null;
}

/**
 * Every order ever created, newest first. Order numbers are a dense
 * sequence (CDM-100001, CDM-100002, …) assigned by the same counter this
 * reads, so the full set is recovered with one counter GET + one batched
 * MGET — no key-scanning index to maintain.
 */
export async function listOrders(): Promise<OrderRecord[]> {
  if (!isRedisConfigured()) return [];
  const raw = await redisGet(COUNTER_KEY);
  const count = raw ? parseInt(raw, 10) : 0;
  if (!count || count < 1) return [];

  const keys = Array.from({ length: count }, (_, i) =>
    orderKey(`CDM-${ORDER_START + i + 1}`),
  );
  const values = await redisMGet(keys);
  if (!values) return [];

  const orders: OrderRecord[] = [];
  for (const v of values) {
    if (!v) continue;
    try {
      orders.push(JSON.parse(v) as OrderRecord);
    } catch {
      // Skip a malformed record rather than fail the whole roster.
    }
  }
  return orders.reverse();
}

/* -------------------------------------------------------------------------- */
/* Public (PII-free) projection for the order-lookup page                     */
/* -------------------------------------------------------------------------- */

export type PublicOrder = {
  orderNumber: string;
  courseTitle: string;
  courseSlug: string;
  dateLabel: string;
  location: string;
  ceCredits: number;
  amountPaid: string;
  payMode: PayMode;
  balanceDue: string | null;
  purchaseDate: string;
  status: string;
};

/** Strip name/email — anyone with the order number sees order facts only. */
export function publicOrderView(r: OrderRecord): PublicOrder {
  return {
    orderNumber: r.orderNumber,
    courseTitle: r.courseTitle,
    courseSlug: r.courseSlug,
    dateLabel: r.dateLabel,
    location: `${r.city}, ${r.country}`,
    ceCredits: r.ceCredits,
    amountPaid: formatMoney(r.amountPaidCents, r.currency),
    payMode: r.payMode,
    balanceDue:
      r.balanceDueCents > 0 ? formatMoney(r.balanceDueCents, r.currency) : null,
    purchaseDate: r.purchaseDate,
    status: r.status,
  };
}

/* -------------------------------------------------------------------------- */
/* ICS calendar file                                                          */
/* -------------------------------------------------------------------------- */

function icsEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** YYYYMMDD from an ISO date. */
function toIcsDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, "");
}

/** YYYYMMDD one day after the given ISO date (DTEND is exclusive). */
function dayAfter(iso: string): string {
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

/** RFC-5545 calendar file for the order's course — works in Google Calendar,
 *  Apple Calendar, and Outlook. All-day VEVENT spanning the course dates. */
export function buildIcs(r: OrderRecord): string {
  const start = toIcsDate(r.startDate);
  const end = dayAfter(r.endDate ?? r.startDate);
  const stamp =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const description = `California Dental Meeting — Order ${r.orderNumber}. ${
    r.ceCredits > 0 ? `${r.ceCredits} CE credits. ` : ""
  }https://californiadentalmeetings.com/courses/${r.courseSlug}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//California Dental Meeting//Orders//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${r.orderNumber}@californiadentalmeetings.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${icsEscape(r.courseTitle)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `LOCATION:${icsEscape(`${r.venue} — ${r.city}, ${r.country}`)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
