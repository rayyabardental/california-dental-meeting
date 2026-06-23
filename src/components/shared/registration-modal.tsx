"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X, Loader2, MapPin, Calendar } from "lucide-react";
import {
  RegistrationSchema,
  type RegistrationInput,
} from "@/lib/validations/event";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/events-data";

export function RegistrationModal({
  event,
  onClose,
}: {
  event: Event | null;
  onClose: () => void;
}): React.ReactElement {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(RegistrationSchema),
  });

  useEffect(() => {
    if (event) reset({ eventId: event.id });
  }, [event, reset]);

  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [event, onClose]);

  const onSubmit = async (values: RegistrationInput): Promise<void> => {
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as {
        data: { id: string } | null;
        error: string | null;
      };
      if (!res.ok || json.error) {
        toast.error(json.error ?? "Registration failed. Please try again.");
        return;
      }
      toast.success(
        `You're registered for ${event?.title}. Check your inbox for confirmation.`,
      );
      onClose();
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-primary/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="relative my-8 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-30px_rgba(10,37,64,0.55)]"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-ink-muted backdrop-blur-md transition-colors hover:bg-primary hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="bg-gradient-to-br from-primary via-primary-600 to-primary-800 p-7 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                Register · {event.topic}
              </p>
              <h2
                id="register-title"
                className="mt-2 font-display text-2xl leading-snug text-balance"
              >
                {event.title}
              </h2>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-white/85">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gold" />
                  {event.dateLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gold" />
                  {event.city}, {event.country}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-7">
              <input type="hidden" {...register("eventId")} />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  error={errors.firstName?.message}
                  inputProps={{
                    autoComplete: "given-name",
                    ...register("firstName"),
                  }}
                />
                <Field
                  label="Last name"
                  error={errors.lastName?.message}
                  inputProps={{
                    autoComplete: "family-name",
                    ...register("lastName"),
                  }}
                />
              </div>

              <Field
                className="mt-4"
                label="Professional email"
                error={errors.email?.message}
                inputProps={{
                  type: "email",
                  autoComplete: "email",
                  ...register("email"),
                }}
              />

              <Field
                className="mt-4"
                label="License number (optional)"
                error={errors.license?.message}
                inputProps={{
                  autoComplete: "off",
                  ...register("license"),
                }}
              />

              <div className="mt-7 flex items-center justify-between gap-3">
                <p className="text-xs text-ink-muted">
                  By registering you agree to our{" "}
                  <a href="/terms" className="text-primary underline">
                    terms
                  </a>{" "}
                  and code of conduct.
                </p>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {isSubmitting ? "Registering" : "Confirm registration"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  error,
  inputProps,
  className,
}: {
  label: string;
  error?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
}): React.ReactElement {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </span>
      <input
        {...inputProps}
        aria-invalid={Boolean(error)}
        className="w-full rounded-xl border border-primary/15 bg-surface px-4 py-3 text-sm text-primary outline-none transition-all placeholder:text-ink-muted/60 focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
      />
      {error && (
        <span className="mt-1.5 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}
