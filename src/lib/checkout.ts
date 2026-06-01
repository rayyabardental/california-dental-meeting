import type { Course } from "@/lib/events-data";

/**
 * Checkout pricing math — the single source of truth for what a registrant
 * pays. Amounts are always integer cents (USD) and are recomputed
 * server-side on every PaymentIntent, so a tampered client request can never
 * change the charged amount.
 */

export type PayMode = "full" | "deposit";

/** A course that is open AND has structured pricing, narrowed so `.purchase`
 *  is non-optional. Produced by the `isPurchasable` type guard. */
export type PurchasableCourse = Course & {
  purchase: NonNullable<Course["purchase"]>;
};

/** Only OPEN courses with a `purchase` block can be bought online. */
export function isPurchasable(course: Course): course is PurchasableCourse {
  return course.status === "OPEN" && course.purchase !== undefined;
}

/** The full tuition due for the course (early rate when the early-reg
 *  window is active, otherwise the regular rate). */
export function fullAmountCents(course: PurchasableCourse): number {
  return course.earlyRegistrationActive
    ? course.purchase.earlyCents
    : course.purchase.regularCents;
}

/** Savings from the early-registration rate, or 0 when not active. */
export function discountCents(course: PurchasableCourse): number {
  if (!course.earlyRegistrationActive) return 0;
  return Math.max(0, course.purchase.regularCents - course.purchase.earlyCents);
}

/** Amount charged *today* for the chosen payment mode. */
export function amountDueTodayCents(
  course: PurchasableCourse,
  mode: PayMode,
): number {
  return mode === "deposit"
    ? course.purchase.depositCents
    : fullAmountCents(course);
}

/** Remaining balance after today's charge (only non-zero for deposits). */
export function balanceDueCents(
  course: PurchasableCourse,
  mode: PayMode,
): number {
  if (mode !== "deposit") return 0;
  return Math.max(0, fullAmountCents(course) - course.purchase.depositCents);
}

/** Format integer cents as USD, hiding the decimals for whole-dollar amounts. */
export function formatMoney(cents: number, currency = "USD"): string {
  const isWhole = cents % 100 === 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(cents / 100);
}
