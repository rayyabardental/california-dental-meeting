import { z } from "zod";

/**
 * Guest certificate-signing submission. Fields mirror the blanks on the DBC
 * Certificate of Completion (participant name, license number, signature),
 * plus the email address the signed PDF is sent to. The signature is a PNG
 * data URL captured from the on-screen signature pad.
 */
export const CertificateSubmissionSchema = z.object({
  courseId: z.string().min(1, "Missing course."),
  participantName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "Name is too long."),
  licenseNumber: z
    .string()
    .trim()
    .min(1, "Please enter your license or permit number.")
    .max(60, "License number is too long."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(200),
  attests: z.literal(true, {
    message: "Please confirm you met the attendance requirements.",
  }),
  signature: z
    .string()
    .startsWith("data:image/png;base64,", "A signature is required.")
    // A blank pad exports a very short PNG; require a plausibly-drawn one.
    .min(1500, "Please draw your signature before submitting."),
});

export type CertificateSubmission = z.infer<typeof CertificateSubmissionSchema>;
