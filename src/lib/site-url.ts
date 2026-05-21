/**
 * Resolves the canonical site URL across every environment.
 *
 * Priority:
 *   1. NEXT_PUBLIC_SITE_URL — explicit override (custom domain, staging, etc.)
 *   2. VERCEL_PROJECT_PRODUCTION_URL — the stable production domain on Vercel
 *   3. VERCEL_URL — the per-deployment URL (preview deployments)
 *   4. http://localhost:3000 — local development fallback
 *
 * Vercel injects 2 and 3 automatically at build time, so a deployment knows
 * its own URL with zero manual configuration.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.length > 0) {
    return explicit.startsWith("http") ? explicit : `https://${explicit}`;
  }

  const productionDomain =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (productionDomain) return `https://${productionDomain}`;

  const deploymentUrl =
    process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL;
  if (deploymentUrl) return `https://${deploymentUrl}`;

  return "http://localhost:3000";
}
