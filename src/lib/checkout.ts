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

/** True when the registrant sets their own amount (pay-what-you-want). Returns
 *  a plain boolean (not a type guard) so a `!isCustomAmount()` branch never
 *  narrows an already-purchasable course to `never`. */
export function isCustomAmount(course: Course): boolean {
  return isPurchasable(course) && course.purchase.custom === true;
}

/** Allowed amount range for a custom-price course, in integer cents. */
export function customBounds(course: PurchasableCourse): {
  minCents: number;
  maxCents: number;
} {
  return {
    minCents: Math.max(50, course.purchase.minCents ?? 100),
    maxCents: course.purchase.maxCents ?? 5_000_000,
  };
}

/** Whether a chosen custom amount is present and within the allowed range. */
export function isValidCustomAmount(
  course: Course,
  cents: number | null,
): boolean {
  if (!isPurchasable(course)) return false;
  if (cents === null || !Number.isFinite(cents)) return false;
  const { minCents, maxCents } = customBounds(course);
  return cents >= minCents && cents <= maxCents;
}

/** Clamp a proposed custom amount into the course's allowed range. Returns
 *  null when the input isn't a usable positive integer. */
export function clampCustomAmount(
  course: PurchasableCourse,
  cents: number,
): number | null {
  if (!Number.isFinite(cents)) return null;
  const rounded = Math.round(cents);
  if (rounded <= 0) return null;
  const { minCents, maxCents } = customBounds(course);
  return Math.min(maxCents, Math.max(minCents, rounded));
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

/** Whether a deposit option is meaningful for this course (i.e. the deposit
 *  is actually less than the full amount). Single-price courses set the
 *  deposit equal to the full price, which hides the deposit choice. */
export function allowsDeposit(course: PurchasableCourse): boolean {
  return course.purchase.depositCents < fullAmountCents(course);
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
