import { ok } from "@/lib/api-response";
import {
  isConstantContactConfigured,
  isConstantContactConnected,
} from "@/lib/constant-contact";

export const dynamic = "force-dynamic";

/**
 * Lightweight health check for the Constant Contact integration.
 *
 *   { configured: true, connected: true }  -> fully working
 *   { configured: true, connected: false } -> run /api/constant-contact/connect
 *   { configured: false }                  -> environment variables missing
 */
export async function GET(): Promise<Response> {
  const configured = isConstantContactConfigured();
  const connected = configured ? await isConstantContactConnected() : false;
  return ok({ configured, connected });
}
