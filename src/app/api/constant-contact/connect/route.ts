import { NextResponse } from "next/server";
import {
  buildAuthorizeUrl,
  isConstantContactConfigured,
  saveOAuthState,
} from "@/lib/constant-contact";
import { env } from "@/lib/env";
import { htmlPage } from "../_html";

export const dynamic = "force-dynamic";

/**
 * Step 1 of the one-time Constant Contact connection.
 *
 * Visiting this route redirects the site owner to Constant Contact's sign-in
 * screen. After they approve, Constant Contact returns to the callback route.
 */
export async function GET(req: Request): Promise<Response> {
  if (!isConstantContactConfigured()) {
    return htmlPage({
      heading: "Not configured yet",
      message:
        "Add CONSTANT_CONTACT_API_KEY, CONSTANT_CONTACT_CLIENT_SECRET and the Upstash Redis variables in Vercel, redeploy, then open this link again.",
      tone: "error",
      status: 503,
    });
  }

  // Constant Contact rejects any redirect_uri not registered on the app. It
  // normally derives from the host being visited, but CONSTANT_CONTACT_REDIRECT_URI
  // pins it to an already-registered value when the app's settings are locked.
  const origin = new URL(req.url).origin;
  const redirectUri =
    env.CONSTANT_CONTACT_REDIRECT_URI ??
    `${origin}/api/constant-contact/callback`;
  const state = crypto.randomUUID();

  await saveOAuthState(state, redirectUri);

  return NextResponse.redirect(buildAuthorizeUrl(redirectUri, state));
}
