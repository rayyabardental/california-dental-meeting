"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Mail, Phone, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/ui/container";
import { CdmLogo } from "@/components/ui/cdm-logo";
import { ContactSchema, type ContactInput } from "@/lib/validations/event";
import { cn } from "@/lib/utils";

const COORDINATORS = [
  {
    name: "Ray Buelna",
    role: "Enrollment Coordinator",
    phone: "+1 (951) 463-9732",
    href: "tel:+19514639732",
  },
  {
    name: "Jacky Sanchez",
    role: "Enrollment Coordinator",
    phone: "+1 (951) 463-9732",
    href: "tel:+19514639732",
  },
] as const;

export function Contact(): React.ReactElement {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema),
  });

  const onSubmit = async (values: ContactInput): Promise<void> => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as {
        data: { ok: true } | null;
        error: string | null;
      };
      if (!res.ok || json.error) {
        toast.error(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      toast.success(
        "Message received. Ray or Jacky will follow up within one business day.",
      );
      reset({
        name: "",
        email: "",
        organization: "",
        message: "",
      });
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <section
      id="contact"
      aria-label="Contact and reservation"
      className="relative isolate overflow-hidden bg-primary py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 gradient-mesh-dark" />

      <Container size="wide">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold before:inline-block before:h-px before:w-8 before:bg-gold before:content-['']">
              Reserve your spot
            </span>
            <h2 className="mt-4 font-display text-4xl font-medium tracking-tight text-white md:text-5xl text-balance">
              Space is limited to ensure quality hands-on training.
            </h2>
            <p className="mt-5 max-w-lg text-lg text-white/75 text-pretty">
              Contact our enrollment team to confirm your seat for the
              Veracruz 2027 cohort. We&apos;ll follow up with registration
              materials and the tuition schedule.
            </p>

            <div className="mt-10 space-y-4">
              {COORDINATORS.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                >
                  <CdmLogo size={48} className="ring-white/20" />
                  <div className="flex-1">
                    <p className="font-display text-lg font-medium text-white">
                      {c.name}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-gold">
                      {c.role}
                    </p>
                  </div>
                  <a
                    href={c.href}
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-primary transition-transform hover:scale-[1.02]"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-2 text-sm text-white/65">
              <p className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold" />
                <a className="hover:text-white" href="tel:+19514639732">
                  +1 (951) 463-9732
                </a>
              </p>
              <p className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" />
                <a
                  className="hover:text-white"
                  href="mailto:ray.yabardental@gmail.com"
                >
                  ray.yabardental@gmail.com
                </a>
              </p>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-md"
            aria-label="Contact form"
            noValidate
          >
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              <MessageSquare className="h-3.5 w-3.5" />
              Or send a message
            </p>
            <h3 className="mt-2 font-display text-2xl font-medium text-white">
              Tell us about your practice.
            </h3>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field
                label="Your name"
                error={errors.name?.message}
                inputProps={{
                  autoComplete: "name",
                  ...register("name"),
                }}
              />
              <Field
                label="Professional email"
                error={errors.email?.message}
                inputProps={{
                  type: "email",
                  autoComplete: "email",
                  ...register("email"),
                }}
              />
            </div>

            <Field
              className="mt-4"
              label="Practice / organization (optional)"
              error={errors.organization?.message}
              inputProps={{
                autoComplete: "organization",
                ...register("organization"),
              }}
            />

            <label className="mt-4 block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Your message
              </span>
              <textarea
                rows={4}
                aria-invalid={Boolean(errors.message)}
                {...register("message")}
                placeholder="I'd like to reserve a seat for the Veracruz 2027 cohort…"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 transition-all focus:border-gold focus:bg-white/15 focus:ring-4 focus:ring-gold/15"
              />
              {errors.message && (
                <span className="mt-1.5 block text-xs text-rose-300">
                  {errors.message.message}
                </span>
              )}
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold px-7 text-sm font-semibold text-primary transition-all hover:bg-gold-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none",
                "shadow-[0_8px_18px_-6px_rgba(215,161,74,0.55)]",
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting ? "Sending" : "Send to enrollment team"}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>

            <p className="mt-3 text-center text-[11px] text-white/45">
              We&apos;ll respond within one business day.
            </p>
          </motion.form>
        </div>
      </Container>
    </section>
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
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
        {label}
      </span>
      <input
        {...inputProps}
        aria-invalid={Boolean(error)}
        className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 transition-all focus:border-gold focus:bg-white/15 focus:ring-4 focus:ring-gold/15"
      />
      {error && (
        <span className="mt-1.5 block text-xs text-rose-300">{error}</span>
      )}
    </label>
  );
}
