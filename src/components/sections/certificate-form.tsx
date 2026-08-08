"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, GraduationCap, Loader2, ShieldCheck } from "lucide-react";
import { SignaturePad } from "@/components/ui/signature-pad";
import { CdmLogo } from "@/components/ui/cdm-logo";
import type { Course } from "@/lib/events-data";
import { cn } from "@/lib/utils";

type Errors = Partial<
  Record<"participantName" | "licenseNumber" | "email" | "attests" | "signature", string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CertificateForm({
  course,
}: {
  course: Course;
}): React.ReactElement {
  const cert = course.certificate!;
  const [participantName, setParticipantName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [email, setEmail] = useState("");
  const [attests, setAttests] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const validate = (): boolean => {
    const next: Errors = {};
    if (participantName.trim().length < 2)
      next.participantName = "Please enter your full name.";
    if (licenseNumber.trim().length < 1)
      next.licenseNumber = "Please enter your license or permit number.";
    if (!EMAIL_RE.test(email.trim()))
      next.email = "Please enter a valid email address.";
    if (!attests)
      next.attests = "Please confirm you met the attendance requirements.";
    if (!signature) next.signature = "Please draw your signature above.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) {
      document
        .querySelector("[data-error='true']")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          participantName: participantName.trim(),
          licenseNumber: licenseNumber.trim(),
          email: email.trim(),
          attests,
          signature,
        }),
      });
      const json = (await res.json()) as { error: string | null };
      if (!res.ok) {
        setFormError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFormError("Network error. Please check your connection and retry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-lg text-center"
      >
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-accent/10 text-accent">
          <CheckCircle2 className="h-10 w-10" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-medium text-primary md:text-4xl">
          Thank you for attending!
        </h1>
        <p className="mt-4 text-pretty text-ink-muted">
          Your signature has been recorded for{" "}
          <span className="font-medium text-primary">{cert.courseName}</span>.
        </p>
        <div className="mt-6 rounded-2xl border border-primary/10 bg-white p-5 text-sm text-ink-muted">
          Your official Certificate of Completion will be emailed to{" "}
          <span className="font-medium text-primary">{email.trim()}</span> after
          the event concludes. No further action is needed — you may close this
          page.
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Course header */}
      <div className="rounded-3xl border border-primary/10 bg-white p-6 shadow-[0_1px_2px_rgba(13,35,64,0.05)]">
        <div className="flex items-center gap-3">
          <CdmLogo size={44} className="ring-1 ring-primary/15" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-600">
              Certificate of Completion
            </p>
            <p className="font-display text-base font-semibold tracking-wider text-primary">
              California Dental Meeting
            </p>
          </div>
        </div>
        <h1 className="mt-5 font-display text-xl font-medium leading-snug text-primary text-balance">
          {cert.courseName}
        </h1>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-accent" />
            {cert.unitsEarned} CE units
          </span>
          <span>{cert.attendanceDateLabel}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-6">
        {/* Signature */}
        <Field
          label="Your signature"
          required
          error={errors.signature}
          htmlFor="signature-pad"
        >
          <p className="mb-2 text-sm text-ink-muted">
            Sign below to certify that you met the attendance requirements of
            this course.
          </p>
          <SignaturePad
            ariaLabel="Draw your signature"
            onChange={(v) => {
              setSignature(v);
              if (v) setErrors((e) => ({ ...e, signature: undefined }));
            }}
          />
        </Field>

        {/* Participant info */}
        <Field label="Full name" required error={errors.participantName} htmlFor="cert-name">
          <TextInput
            id="cert-name"
            value={participantName}
            onChange={setParticipantName}
            placeholder="As it should appear on the certificate"
            autoComplete="name"
            invalid={Boolean(errors.participantName)}
          />
        </Field>

        <Field
          label="License / permit number"
          required
          error={errors.licenseNumber}
          htmlFor="cert-license"
        >
          <TextInput
            id="cert-license"
            value={licenseNumber}
            onChange={setLicenseNumber}
            placeholder="e.g. CA-DDS-00000"
            invalid={Boolean(errors.licenseNumber)}
          />
        </Field>

        <Field
          label="Email address"
          required
          error={errors.email}
          htmlFor="cert-email"
          hint="Where we'll send your signed certificate after the event."
        >
          <TextInput
            id="cert-email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            invalid={Boolean(errors.email)}
          />
        </Field>

        {/* Attestation */}
        <div data-error={errors.attests ? "true" : undefined}>
          <label className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-white p-4">
            <input
              type="checkbox"
              checked={attests}
              onChange={(e) => {
                setAttests(e.target.checked);
                if (e.target.checked)
                  setErrors((er) => ({ ...er, attests: undefined }));
              }}
              className="mt-0.5 h-5 w-5 flex-none rounded border-primary/30 text-accent focus:ring-accent"
            />
            <span className="text-sm text-ink">
              I certify that I met the attendance requirements of this course
              and that the information provided is truthful and accurate.
            </span>
          </label>
          {errors.attests && (
            <p className="mt-1.5 text-sm text-red-600">{errors.attests}</p>
          )}
        </div>

        {formError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-white",
            "shadow-[0_10px_24px_-10px_rgba(13,35,64,0.6)] transition-all hover:bg-primary-600 active:scale-[0.99]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            "disabled:opacity-60",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              Submit certificate
            </>
          )}
        </button>
        <p className="text-center text-xs text-ink-muted">
          Your signature is stored securely and used only on your Certificate of
          Completion.
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div data-error={error ? "true" : undefined}>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-semibold text-primary"
      >
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </label>
      {hint && <p className="-mt-1 mb-2 text-xs text-ink-muted">{hint}</p>}
      {children}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "email" | "text";
  invalid?: boolean;
}): React.ReactElement {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      aria-invalid={invalid}
      className={cn(
        "h-12 w-full rounded-xl border bg-white px-4 text-base text-primary outline-none transition-all",
        "placeholder:text-ink-muted/50 focus:ring-4",
        invalid
          ? "border-red-300 focus:border-red-400 focus:ring-red-100"
          : "border-primary/15 focus:border-accent focus:ring-accent/15",
      )}
    />
  );
}
