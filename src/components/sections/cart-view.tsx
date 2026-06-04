"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Check,
  GraduationCap,
  Lock,
  MapPin,
  ShoppingCart,
  User,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { findEvent, ceLabel } from "@/lib/events-data";
import {
  isPurchasable,
  allowsDeposit,
  amountDueTodayCents,
  balanceDueCents,
  discountCents,
  fullAmountCents,
  formatMoney,
  type PayMode,
  type PurchasableCourse,
} from "@/lib/checkout";
import { useCartStore, useCartHydrated } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export function CartView(): React.ReactElement {
  const hydrated = useCartHydrated();
  const courseId = useCartStore((s) => s.courseId);
  const payMode = useCartStore((s) => s.payMode);
  const setPayMode = useCartStore((s) => s.setPayMode);

  const course = courseId ? findEvent(courseId) : undefined;

  return (
    <section className="relative min-h-[70vh] bg-surface py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-sand-100 to-transparent" />
      <Container size="wide">
        <SectionEyebrow tone="accent">Registration</SectionEyebrow>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl">
          Your cart
        </h1>

        {!hydrated ? (
          <div className="mt-12 h-64 animate-pulse rounded-3xl border border-primary/8 bg-white" />
        ) : !course || !isPurchasable(course) ? (
          <EmptyCart />
        ) : (
          <FilledCart
            course={course}
            payMode={payMode}
            onPayModeChange={setPayMode}
          />
        )}
      </Container>
    </section>
  );
}

function EmptyCart(): React.ReactElement {
  return (
    <div className="mt-12 flex flex-col items-center rounded-3xl border border-primary/10 bg-white px-6 py-20 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-accent/10 text-accent">
        <ShoppingCart className="h-7 w-7" />
      </span>
      <h2 className="mt-6 font-display text-2xl font-medium text-primary">
        Your cart is empty
      </h2>
      <p className="mt-2 max-w-md text-ink-muted text-pretty">
        Browse our programs and reserve your seat at an upcoming California
        Dental Meeting course.
      </p>
      <Button href="/courses" variant="primary" size="lg" className="mt-8">
        Explore courses
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function FilledCart({
  course,
  payMode,
  onPayModeChange,
}: {
  course: PurchasableCourse;
  payMode: PayMode;
  onPayModeChange: (mode: PayMode) => void;
}): React.ReactElement {
  const currency = course.purchase.currency;
  const fullAmount = fullAmountCents(course);
  const discount = discountCents(course);
  const canDeposit = allowsDeposit(course);
  // Single-price courses (deposit == full) can't be paid by deposit; force full.
  const mode: PayMode = canDeposit ? payMode : "full";
  const dueToday = amountDueTodayCents(course, mode);
  const balance = balanceDueCents(course, mode);
  const earlyActive = course.earlyRegistrationActive && discount > 0;

  useEffect(() => {
    if (!canDeposit && payMode !== "full") onPayModeChange("full");
  }, [canDeposit, payMode, onPayModeChange]);

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      {/* Selected course + payment option */}
      <div className="space-y-6">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-[0_1px_2px_rgba(13,35,64,0.04)]"
        >
          <div className="relative h-28 sunset-gradient">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_60%)]" />
            <div className="relative flex h-full items-end justify-between p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85">
                {course.topic}
              </p>
              {earlyActive && (
                <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  Early rate
                </span>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-7">
            <h2 className="font-display text-2xl font-medium leading-snug text-primary text-balance">
              {course.title}
            </h2>
            <p className="mt-1 text-sm font-medium uppercase tracking-[0.16em] text-accent-600">
              {course.subtitle}
            </p>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <CartMeta
                icon={<Calendar className="h-4 w-4" />}
                label="Dates"
                value={course.dateLabel}
              />
              <CartMeta
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={`${course.venue} · ${course.city}, ${course.country}`}
              />
              <CartMeta
                icon={<GraduationCap className="h-4 w-4" />}
                label="CE Credits"
                value={ceLabel(course, "value")}
              />
              <CartMeta
                icon={<User className="h-4 w-4" />}
                label="Course Director"
                value={course.speaker.name}
              />
            </dl>
          </div>
        </motion.article>

        {/* Payment option selector — only when a real deposit option exists */}
        {canDeposit && (
          <div className="rounded-3xl border border-primary/10 bg-white p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
              Choose how to pay
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <PayOption
                active={mode === "full"}
                onClick={() => onPayModeChange("full")}
                title="Pay in full"
                amount={formatMoney(fullAmount, currency)}
                note={
                  earlyActive
                    ? `Includes ${formatMoney(discount, currency)} early-registration discount`
                    : "Full tuition, settled today"
                }
              />
              <PayOption
                active={mode === "deposit"}
                onClick={() => onPayModeChange("deposit")}
                title="Reserve with deposit"
                amount={formatMoney(course.purchase.depositCents, currency)}
                note={`Balance of ${formatMoney(
                  fullAmountCents(course) - course.purchase.depositCents,
                  currency,
                )} collected before the course`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Order summary */}
      <aside className="lg:sticky lg:top-28">
        <div className="rounded-3xl border border-primary/10 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(13,35,64,0.35)] sm:p-7">
          <h2 className="font-display text-xl font-medium text-primary">
            Order summary
          </h2>

          <dl className="mt-5 space-y-3 text-sm">
            <SummaryRow
              label={earlyActive ? "Tuition (regular)" : "Tuition"}
              value={formatMoney(
                earlyActive ? course.purchase.regularCents : fullAmount,
                currency,
              )}
            />
            {earlyActive && (
              <SummaryRow
                label="Early-registration discount"
                value={`– ${formatMoney(discount, currency)}`}
                accent
              />
            )}
            {mode === "deposit" && (
              <SummaryRow
                label="Reservation deposit"
                value={formatMoney(course.purchase.depositCents, currency)}
              />
            )}
          </dl>

          <div className="mt-5 flex items-baseline justify-between border-t border-primary/10 pt-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              Due today
            </span>
            <span className="font-display text-3xl font-medium text-primary">
              {formatMoney(dueToday, currency)}
            </span>
          </div>
          {balance > 0 && (
            <p className="mt-2 text-right text-xs text-ink-muted">
              Then {formatMoney(balance, currency)} balance before the course
            </p>
          )}

          <Button
            href="/checkout"
            variant="primary"
            size="lg"
            className="mt-6 w-full"
          >
            <Lock className="h-4 w-4" />
            Proceed to secure payment
          </Button>
          <Link
            href="/courses"
            className="mt-3 block text-center text-sm font-medium text-ink-muted underline-offset-4 hover:text-primary hover:underline"
          >
            Continue browsing
          </Link>

          <ul className="mt-6 space-y-2 border-t border-primary/10 pt-5 text-xs text-ink-muted">
            <TrustItem>Secured by Stripe · TLS-encrypted checkout</TrustItem>
            <TrustItem>
              We never see or store your card details
            </TrustItem>
            <TrustItem>Pay by card or PayPal</TrustItem>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function CartMeta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <div>
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
        <span className="text-accent">{icon}</span>
        {label}
      </p>
      <p className="mt-1.5 text-sm font-medium text-primary text-pretty">
        {value}
      </p>
    </div>
  );
}

function PayOption({
  active,
  onClick,
  title,
  amount,
  note,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  amount: string;
  note: string;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-2xl border p-4 text-left transition-all",
        active
          ? "border-accent bg-accent/[0.06] ring-2 ring-accent/30"
          : "border-primary/12 bg-surface hover:border-accent/50",
      )}
    >
      <span className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{title}</span>
        <span
          className={cn(
            "grid h-5 w-5 place-items-center rounded-full border",
            active
              ? "border-accent bg-accent text-white"
              : "border-primary/25 text-transparent",
          )}
        >
          <Check className="h-3 w-3" />
        </span>
      </span>
      <span className="mt-2 block font-display text-2xl font-medium text-primary">
        {amount}
      </span>
      <span className="mt-1 block text-xs text-ink-muted text-pretty">
        {note}
      </span>
    </button>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={cn("font-medium", accent ? "text-accent-700" : "text-primary")}>
        {value}
      </dd>
    </div>
  );
}

function TrustItem({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <li className="flex items-center gap-2">
      <Lock className="h-3 w-3 flex-none text-accent" />
      {children}
    </li>
  );
}
