import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { CertificateRecord } from "@/lib/certificates";
import type { Course } from "@/lib/events-data";

/**
 * Renders the Dental Board of California "Certification of Completion of
 * Continuing Education Course" as a single-page PDF, filled with the
 * participant's details and their hand-drawn signature.
 *
 * The fixed provider content (registration number, approval number, course
 * name, hours, legal text) comes from `course.certificate`; the variable
 * fields (name, license, signature, date) come from the certificate record.
 * Pure `pdf-lib` — no native dependencies, safe in the serverless runtime.
 */

const NAVY = rgb(13 / 255, 35 / 255, 64 / 255);
const BLACK = rgb(0.1, 0.1, 0.1);
const GREY = rgb(0.35, 0.35, 0.35);

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/** Split text into lines that fit `maxWidth` at the given font/size. */
function wrapLines(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const attempt = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(attempt, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = attempt;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function buildCertificatePdf(
  record: CertificateRecord,
  course: Course,
): Promise<Uint8Array> {
  const cert = course.certificate;
  if (!cert) {
    throw new Error(`Course ${course.id} has no certificate metadata.`);
  }

  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = PAGE_H - MARGIN;

  const text = (
    s: string,
    x: number,
    yy: number,
    opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb> } = {},
  ): void => {
    page.drawText(s, {
      x,
      y: yy,
      size: opts.size ?? 10,
      font: opts.font ?? font,
      color: opts.color ?? BLACK,
    });
  };

  const centered = (
    s: string,
    yy: number,
    opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb> } = {},
  ): void => {
    const f = opts.font ?? font;
    const size = opts.size ?? 10;
    const w = f.widthOfTextAtSize(s, size);
    text(s, MARGIN + (CONTENT_W - w) / 2, yy, opts);
  };

  /** Draw a labelled value "LABEL: value" with a bold label. Returns end x. */
  const labelValue = (
    label: string,
    value: string,
    x: number,
    yy: number,
    size = 10,
  ): number => {
    text(label, x, yy, { size, font: bold, color: NAVY });
    const lx = x + bold.widthOfTextAtSize(label + " ", size);
    text(value, lx, yy, { size });
    return lx + font.widthOfTextAtSize(value, size);
  };

  const paragraph = (
    s: string,
    yy: number,
    size = 8.5,
    color = GREY,
    lineHeight = 12,
  ): number => {
    const lines = wrapLines(s, font, size, CONTENT_W);
    let cursor = yy;
    for (const line of lines) {
      text(line, MARGIN, cursor, { size, color });
      cursor -= lineHeight;
    }
    return cursor;
  };

  // ── Header ──────────────────────────────────────────────────────────────
  centered("CALIFORNIA DENTAL MEETING", y, {
    size: 15,
    font: bold,
    color: NAVY,
  });
  y -= 26;
  centered("CERTIFICATION OF COMPLETION OF CONTINUING EDUCATION COURSE", y, {
    size: 12,
    font: bold,
    color: BLACK,
  });
  y -= 14;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 1.2,
    color: rgb(215 / 255, 161 / 255, 74 / 255),
  });
  y -= 28;

  // ── Fixed provider block ────────────────────────────────────────────────
  labelValue(
    "11-DIGIT COURSE REGISTRATION NUMBER:",
    cert.registrationNumber,
    MARGIN,
    y,
  );
  y -= 22;

  labelValue("PROVIDER NAME:", "California Dental Meeting", MARGIN, y);
  labelValue("APPROVAL NUMBER:", cert.approvalNumber, MARGIN + 300, y);
  y -= 22;

  // Course name can wrap.
  text("COURSE NAME:", MARGIN, y, { size: 10, font: bold, color: NAVY });
  {
    const labelW = bold.widthOfTextAtSize("COURSE NAME: ", 10);
    const nameLines = wrapLines(cert.courseName, font, 10, CONTENT_W - labelW);
    text(nameLines[0] ?? "", MARGIN + labelW, y, { size: 10 });
    for (let i = 1; i < nameLines.length; i++) {
      y -= 14;
      text(nameLines[i]!, MARGIN + labelW, y, { size: 10 });
    }
  }
  y -= 22;

  labelValue(
    "DATE(S) OF ATTENDANCE/COMPLETION:",
    cert.attendanceDateLabel,
    MARGIN,
    y,
  );
  y -= 22;

  labelValue(
    "NUMBER OF COMPLETED HOURS:",
    String(cert.completedHours),
    MARGIN,
    y,
  );
  labelValue("UNITS EARNED:", String(cert.unitsEarned), MARGIN + 300, y);
  y -= 30;

  // ── Participant (variable) block ────────────────────────────────────────
  labelValue("PARTICIPANT'S NAME:", record.participantName, MARGIN, y);
  y -= 22;
  labelValue("LICENSE/PERMIT NUMBER:", record.licenseNumber, MARGIN, y);
  y -= 26;

  text(
    "All of the information contained on this certificate is truthful and accurate.",
    MARGIN,
    y,
    { size: 9, color: BLACK },
  );
  y -= 22;

  y =
    paragraph(
      "Completion of this course does not constitute authorization for the attendee to perform any services that he or she is not legally authorized to perform based on his or her license or permit type.",
      y,
    ) - 6;

  text(
    `This course meets the Dental Board of California's requirements for ${cert.unitsEarned} units of continuing education.`,
    MARGIN,
    y,
    { size: 9, font: bold, color: BLACK },
  );
  y -= 34;

  // ── Provider signature ──────────────────────────────────────────────────
  text("PROVIDER'S SIGNATURE:", MARGIN, y, {
    size: 9,
    font: bold,
    color: NAVY,
  });
  text("Date:", MARGIN + 340, y, { size: 9, font: bold, color: NAVY });
  y -= 26;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + 300, y },
    thickness: 0.8,
    color: BLACK,
  });
  text(cert.providerSignatureDate, MARGIN + 340, y + 3, { size: 9 });
  y -= 12;
  text("Authorized Representative, California Dental Meeting", MARGIN, y, {
    size: 8,
    color: GREY,
  });
  y -= 34;

  // ── Licensee signature (the drawn signature) ────────────────────────────
  text("LICENSEE SIGNATURE:", MARGIN, y, {
    size: 9,
    font: bold,
    color: NAVY,
  });
  text("Date:", MARGIN + 340, y, { size: 9, font: bold, color: NAVY });

  // Embed the drawn signature just above its line.
  try {
    const base64 = record.signature.split(",")[1] ?? "";
    const bytes = Buffer.from(base64, "base64");
    const png = await doc.embedPng(bytes);
    const maxW = 240;
    const maxH = 54;
    const scale = Math.min(maxW / png.width, maxH / png.height, 1);
    const w = png.width * scale;
    const h = png.height * scale;
    page.drawImage(png, { x: MARGIN, y: y - h - 2, width: w, height: h });
  } catch {
    // If the signature can't be decoded, still print the line below.
  }

  y -= 30;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + 300, y },
    thickness: 0.8,
    color: BLACK,
  });
  text(fmtDate(record.signedDate), MARGIN + 340, y + 3, { size: 9 });
  y -= 12;
  text("I certify that I met the attendance requirements of this course.", MARGIN, y, {
    size: 8,
    color: GREY,
  });
  y -= 30;

  // ── Compliance footer ───────────────────────────────────────────────────
  paragraph(
    "This certificate complies with Business and Professions Code section 1741(e)-(f) and California Code of Regulations, title 16, section 1016(g), (h)(1)(A-C), and (h)(7). Provider is required to retain a copy of every issued certificate, together with the course roster, for a minimum of three provider renewal periods (6 years).",
    y,
    7.5,
    GREY,
    10,
  );

  // Certificate id, bottom-right, for the provider's records.
  text(record.certNumber, PAGE_W - MARGIN - font.widthOfTextAtSize(record.certNumber, 8), MARGIN - 20, {
    size: 8,
    color: GREY,
  });

  return doc.save();
}
