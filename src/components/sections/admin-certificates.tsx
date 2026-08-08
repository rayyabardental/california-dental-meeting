"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, Loader2, Mail, Printer, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENTS } from "@/lib/events-data";

export type CertRow = {
  certNumber: string;
  courseTitle: string;
  participantName: string;
  licenseNumber: string;
  email: string;
  status: "pending" | "sent";
  signedDate: string;
  sentDate?: string;
};

/* -------------------------------------------------------------------------- */
/* CSV export                                                                 */
/* -------------------------------------------------------------------------- */

function csvEscape(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function ExportCertsCsvButton({
  rows,
  filename,
}: {
  rows: CertRow[];
  filename: string;
}): React.ReactElement {
  const onExport = (): void => {
    const header = [
      "Certificate number",
      "Course",
      "Participant name",
      "License/permit number",
      "Email",
      "Status",
      "Signed date",
      "Sent date",
    ];
    const lines = rows.map((r) =>
      [
        r.certNumber,
        r.courseTitle,
        r.participantName,
        r.licenseNumber,
        r.email,
        r.status,
        new Date(r.signedDate).toLocaleString("en-US"),
        r.sentDate ? new Date(r.sentDate).toLocaleString("en-US") : "",
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
    const csv = [header.join(","), ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onExport}
      disabled={rows.length === 0}
    >
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/* Send due certificates now                                                  */
/* -------------------------------------------------------------------------- */

export function SendDueCertsButton(): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const onSend = async (): Promise<void> => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/send-certificates", {
        method: "POST",
      });
      const json = (await res.json()) as {
        data: {
          sent: string[];
          failed: string[];
          pendingNotYetDue: number;
        } | null;
        error: string | null;
      };
      if (!res.ok || json.error || !json.data) {
        setResult(json.error ?? "Send failed.");
      } else {
        const { sent, failed, pendingNotYetDue } = json.data;
        setResult(
          `${sent.length} sent, ${failed.length} failed, ${pendingNotYetDue} not due yet.`,
        );
      }
    } catch {
      setResult("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button variant="outline" size="sm" onClick={onSend} disabled={loading}>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Mail className="h-3.5 w-3.5" />
        )}
        Send due certificates
      </Button>
      {result && (
        <p className="max-w-xs text-right text-[11px] text-ink-muted">{result}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Printable QR generator                                                     */
/* -------------------------------------------------------------------------- */

export function CertQrGenerator(): React.ReactElement {
  const certCourses = useMemo(
    () => EVENTS.filter((c) => c.certificate),
    [],
  );
  const [courseId, setCourseId] = useState(certCourses[0]?.id ?? "");
  const [origin, setOrigin] = useState("");
  const [qr, setQr] = useState("");

  useEffect(() => {
    // Deferred so setState isn't called synchronously in the effect body,
    // and so server + first client render agree (no hydration mismatch).
    const id = window.setTimeout(() => setOrigin(window.location.origin), 0);
    return () => window.clearTimeout(id);
  }, []);

  const url = origin && courseId ? `${origin}/certificate?event=${courseId}` : "";

  useEffect(() => {
    if (!url) return;
    let active = true;
    QRCode.toDataURL(url, { width: 640, margin: 2 })
      .then((d) => {
        if (active) setQr(d);
      })
      .catch(() => {
        if (active) setQr("");
      });
    return () => {
      active = false;
    };
  }, [url]);

  const course = certCourses.find((c) => c.id === courseId);
  const courseName = course?.certificate?.courseName ?? "";

  const download = (): void => {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `cdm-certificate-qr-${courseId}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const print = (): void => {
    if (!qr) return;
    const w = window.open("", "_blank", "width=700,height=900");
    if (!w) return;
    w.document.write(`
      <html><head><title>Certificate QR — ${courseName}</title>
      <style>
        body{font-family:Arial,sans-serif;text-align:center;padding:48px;color:#0d2340}
        h1{font-size:22px;margin:0 0 6px}
        h2{font-size:15px;font-weight:normal;color:#5a6a82;margin:0 0 28px}
        img{width:340px;height:340px}
        p{margin-top:24px;font-size:16px;font-weight:600}
        small{color:#5a6a82;font-weight:normal}
      </style></head>
      <body>
        <h1>California Dental Meeting</h1>
        <h2>${courseName}</h2>
        <img src="${qr}" alt="Certificate QR code" />
        <p>Scan to sign your Certificate of Completion</p>
        <small>${url}</small>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  };

  if (certCourses.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No courses have certificate details configured yet.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <label
          htmlFor="qr-course"
          className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted"
        >
          Event
        </label>
        <select
          id="qr-course"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full rounded-xl border border-primary/15 bg-white px-4 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
        >
          {certCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.certificate!.courseName}
            </option>
          ))}
        </select>
        <p className="mt-3 break-all text-xs text-ink-muted">{url}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={print} disabled={!qr}>
            <Printer className="h-3.5 w-3.5" />
            Print QR
          </Button>
          <Button variant="outline" size="sm" onClick={download} disabled={!qr}>
            <Download className="h-3.5 w-3.5" />
            Download PNG
          </Button>
        </div>
      </div>
      <div className="justify-self-center rounded-2xl border border-primary/10 bg-white p-4">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qr}
            alt={`QR code linking to the certificate page for ${courseName}`}
            width={180}
            height={180}
            className="h-44 w-44"
          />
        ) : (
          <div className="grid h-44 w-44 place-items-center text-ink-muted">
            <QrCode className="h-8 w-8" />
          </div>
        )}
      </div>
    </div>
  );
}
