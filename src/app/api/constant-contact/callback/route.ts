import { consumeOAuthState, exchangeCodeForTokens } from "@/lib/constant-contact";
import { htmlPage } from "../_html";

export const dynamic = "force-dynamic";

/**
 * Step 2 of the one-time Constant Contact connection.
 *
 * Constant Contact redirects here with an authorization `code` after the site
 * owner approves access. The code is exchanged for tokens, which are stored in
 * Redis. From this point every form submission syncs automatically.
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return htmlPage({
      heading: "Connection cancelled",
      message: `Constant Contact reported: ${oauthError}. Close this tab and open the connect link again to retry.`,
      tone: "error",
    });
  }

  if (!code || !state) {
    return htmlPage({
      heading: "Invalid callback",
      message:
        "The authorization response was missing required information. Open the connect link again to retry.",
      tone: "error",
    });
  }

  const redirectUri = await consumeOAuthState(state);
  if (!redirectUri) {
    return htmlPage({
      heading: "Session expired",
      message:
        "This authorization link expired or was already used. Open the connect link again to retry.",
      tone: "error",
    });
  }

  const connected = await exchangeCodeForTokens(code, redirectUri);
  if (!connected) {
    return htmlPage({
      heading: "Connection failed",
      message:
        "We could not complete the connection. Double-check the API key and client secret in Vercel, then retry.",
      tone: "error",
    });
  }

  return htmlPage({
    heading: "Connected to Constant Contact",
    message:
      "Your website is linked. Every course application and contact-form submission will now be added to your Constant Contact list automatically. You can close this tab.",
    tone: "success",
  });
}
