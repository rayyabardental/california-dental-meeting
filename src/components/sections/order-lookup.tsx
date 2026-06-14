"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarPlus,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Loader2,
  MapPin,
  Receipt,
  Search,
  Tag,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/ui/section-eyebrow";
import { cn } from "@/lib/utils";

type PublicOrder = {
  orderNumber: string;
  courseTitle: string;
  courseSlug: string;
  dateLabel: string;
  location: string;
  ceCredits: number;
  amountPaid: string;
  payMode: "full" | "deposit";
  balanceDue: string | null;
  purchaseDate: string;
  status: string;
};

type LookupState = {
  loading: boolean;
  order: PublicOrder | null;
  error: string | null;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function OrderLookup(): React.ReactElement {
  const params = useSearchParams();
  const initial = params.get("order") ?? "";
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<LookupState>({
    loading: false,
    order: null,
    error: null,
  });

  const lookup = useCallback(async (order: string): Promise<void> => {
    const q = order.trim();
    if (!q) {
      setState({ loading: false, order: null, error: "Enter your order number." });
      return;
    }
    setState({ loading: true, order: null, error: null });
    try {
      const res = await fetch(
        `/api/orders/lookup?order=${encodeURIComponent(q)}`,
      );
      const json = (await res.json()) as {
        data: PublicOrder | null;
        error: string | null;
      };
      if (!res.ok || json.error || !json.data) {
        setState({
          loading: false,
          order: null,
          error:
            json.error ??
            "We couldn't find an order with that number. Please check it and try again.",
        });
        return;
      }
      setState({ loading: false, order: json.data, error: null });
    } catch {
      setState({
        loading: false,
        order: null,
        error: "Network error. Please try again.",
      });
    }
  }, []);

  // Auto-lookup when arriving with ?order=… (e.g. from the confirmation page).
  // Deferred so the loading state isn't set synchronously inside the effect.
  useEffect(() => {
    if (!initial) return;
    const id = window.setTimeout(() => void lookup(initial), 0);
    return () => window.clearTimeout(id);
  }, [initial, lookup]);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    void lookup(value);
  };

  return (
    <section className="relative min-h-[70vh] bg-surface py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-sand-100 to-transparent" />
      <Container size="default">
        <div className="mx-auto max-w-xl">
          <SectionEyebrow tone="accent">Order lookup</SectionEyebrow>
          <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-primary md:text-5xl">
            Find your registration
          </h1>
          <p className="mt-4 text-ink-muted text-pretty">
            Enter your order number to view your registration details and add
            the course to your calendar. No account required.
          </p>

          <form
            onSubmit={onSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <label className="sr-only" htmlFor="order-number">
              Order number
            </label>
            <input
              id="order-number"
              value={value}
              onChange={(e) => setValue(e.target.value.toUpperCase())}
              placeholder="CDM-100001"
              autoComplete="off"
              spellCheck={false}
              className="w-full flex-1 rounded-full border border-primary/15 bg-white px-5 py-3 text-sm font-medium tracking-wide text-primary outline-none transition-all placeholder:text-ink-muted/50 focus:border-accent focus:ring-4 focus:ring-accent/15"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={state.loading}
            >
              {state.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Look up order
            </Button>
          </form>

          {state.error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
              <span>{state.error}</span>
            </div>
          )}

          {state.order && <Result order={state.order} />}
        </div>
      </Container>
    </section>
  );
}

function Result({ order }: { order: PublicOrder }): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-[0_20px_50px_-30px_rgba(13,35,64,0.35)]"
    >
      <div className="flex items-center justify-between gap-4 border-b border-primary/8 bg-sand-100 px-6 py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Order
          </p>
          <p className="mt-0.5 font-display text-xl font-semibold tracking-wide text-primary">
            {order.orderNumber}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {order.status === "confirmed" ? "Confirmed" : order.status}
        </span>
      </div>

      <div className="p-6 sm:p-7">
        <h2 className="font-display text-2xl font-medium leading-snug text-primary text-balance">
          {order.courseTitle}
        </h2>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <Detail
            icon={<Calendar className="h-4 w-4" />}
            label="Date"
            value={order.dateLabel}
          />
          <Detail
            icon={<MapPin className="h-4 w-4" />}
            label="Location"
            value={order.location}
          />
          <Detail
            icon={<GraduationCap className="h-4 w-4" />}
            label="CE Credits"
            value={
              order.ceCredits > 0 ? `${order.ceCredits} credits` : "TBA"
            }
          />
          <Detail
            icon={<Tag className="h-4 w-4" />}
            label={order.payMode === "deposit" ? "Deposit paid" : "Price paid"}
            value={order.amountPaid}
          />
          <Detail
            icon={<Receipt className="h-4 w-4" />}
            label="Purchase date"
            value={formatDate(order.purchaseDate)}
          />
          {order.balanceDue && (
            <Detail
              icon={<Tag className="h-4 w-4" />}
              label="Balance due before course"
              value={order.balanceDue}
            />
          )}
        </dl>

        <div className="mt-7 flex flex-col gap-3 border-t border-primary/8 pt-6 sm:flex-row">
          <a
            href={`/api/orders/calendar?order=${encodeURIComponent(order.orderNumber)}`}
            download
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6",
              "text-[0.95rem] font-medium text-white transition-colors hover:bg-primary-600",
            )}
          >
            <CalendarPlus className="h-4 w-4" />
            Add to calendar (.ics)
          </a>
          <Button
            href={`/courses/${order.courseSlug}`}
            variant="ghost"
            size="md"
          >
            View course details
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="mt-5 text-xs text-ink-muted">
          Need help with your registration? Contact our enrollment team at{" "}
          <a
            href="mailto:ray.yabardental@gmail.com"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            ray.yabardental@gmail.com
          </a>{" "}
          or{" "}
          <a
            href="tel:+19513164714"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            +1 (951) 316-4714
          </a>
          .
        </p>
      </div>
    </motion.div>
  );
}

function Detail({
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
