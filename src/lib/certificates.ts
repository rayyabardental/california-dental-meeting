import {
  isRedisConfigured,
  redisGet,
  redisMGet,
  redisSet,
  redisIncr,
  redisDel,
} from "@/lib/redis";

/**
 * Certificate-of-completion records.
 *
 * Created when a guest signs at an event (the QR-code flow), stored in Redis
 * keyed by a human-friendly certificate number. Holds the participant details
 * and their signature image — no payment data. Certificates are emailed as a
 * signed PDF after the event concludes; `status` tracks that lifecycle.
 */
export type CertificateStatus = "pending" | "sent";

export type CertificateRecord = {
  certNumber: string;
  courseId: string;
  courseTitle: string;
  participantName: string;
  licenseNumber: string;
  email: string;
  /** PNG data URL of the hand-drawn signature (data:image/png;base64,…). */
  signature: string;
  /** ISO datetime the participant signed. */
  signedDate: string;
  status: CertificateStatus;
  /** ISO datetime the certificate email was sent, once sent. */
  sentDate?: string;
};

export type NewCertificateInput = Omit<
  CertificateRecord,
  "certNumber" | "signedDate" | "status" | "sentDate"
>;

const COUNTER_KEY = "certs:counter";
const CERT_START = 100000;
const certKey = (n: string): string => `cert:${n.trim().toUpperCase()}`;

/** Create and persist a new certificate record, assigning the next number. */
export async function createCertificate(
  input: NewCertificateInput,
): Promise<CertificateRecord | null> {
  if (!isRedisConfigured()) return null;
  const n = await redisIncr(COUNTER_KEY);
  if (n === null) return null;
  const record: CertificateRecord = {
    ...input,
    certNumber: `CERT-${n + CERT_START}`,
    signedDate: new Date().toISOString(),
    status: "pending",
  };
  const wrote = await redisSet(certKey(record.certNumber), JSON.stringify(record));
  return wrote ? record : null;
}

export async function getCertificate(
  certNumber: string,
): Promise<CertificateRecord | null> {
  if (!isRedisConfigured() || !certNumber.trim()) return null;
  const raw = await redisGet(certKey(certNumber));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CertificateRecord;
  } catch {
    return null;
  }
}

/**
 * Every certificate ever created, newest first. Certificate numbers are a
 * dense sequence assigned by the same counter this reads, so the full set is
 * recovered with one counter GET + one batched MGET.
 */
export async function listCertificates(): Promise<CertificateRecord[]> {
  if (!isRedisConfigured()) return [];
  const raw = await redisGet(COUNTER_KEY);
  const count = raw ? parseInt(raw, 10) : 0;
  if (!count || count < 1) return [];

  const keys = Array.from({ length: count }, (_, i) =>
    certKey(`CERT-${CERT_START + i + 1}`),
  );
  const values = await redisMGet(keys);
  if (!values) return [];

  const certs: CertificateRecord[] = [];
  for (const v of values) {
    if (!v) continue;
    try {
      certs.push(JSON.parse(v) as CertificateRecord);
    } catch {
      // Skip a malformed record rather than fail the whole list.
    }
  }
  return certs.reverse();
}

/** Persist mutations to an existing certificate (e.g. marking it sent). */
export async function saveCertificate(
  record: CertificateRecord,
): Promise<boolean> {
  if (!isRedisConfigured()) return false;
  return redisSet(certKey(record.certNumber), JSON.stringify(record));
}

export type DeleteResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "already_sent" | "unavailable" };

/**
 * Delete a certificate that has NOT yet been issued (status "pending"). Issued
 * ("sent") certificates are retained — the DBC requires providers to keep every
 * issued certificate for six years — so those are refused. When the store is
 * emptied by the deletion, the numbering counter is reset so the next
 * certificate starts cleanly at CERT-100001 (used to clear test data).
 */
export async function deletePendingCertificate(
  certNumber: string,
): Promise<DeleteResult> {
  if (!isRedisConfigured()) return { ok: false, reason: "unavailable" };
  const record = await getCertificate(certNumber);
  if (!record) return { ok: false, reason: "not_found" };
  if (record.status === "sent") return { ok: false, reason: "already_sent" };

  await redisDel(certKey(record.certNumber));

  const remaining = await listCertificates();
  if (remaining.length === 0) await redisSet(COUNTER_KEY, "0");

  return { ok: true };
}
