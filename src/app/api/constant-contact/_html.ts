/**
 * Shared HTML page renderer for the Constant Contact OAuth setup routes.
 * These pages are seen only by the site owner during the one-time connect
 * flow, so a single self-contained, inline-styled document is sufficient.
 */
export function htmlPage(opts: {
  heading: string;
  message: string;
  tone: "success" | "error";
  status?: number;
}): Response {
  const accent = opts.tone === "success" ? "#1b8a5a" : "#c0392b";
  const mark = opts.tone === "success" ? "&#10003;" : "&#33;";
  const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${escapeHtml(opts.heading)} &middot; California Dental Meeting</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center;
    justify-content: center; padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #0d2340; color: #1a1a2e;
  }
  .card {
    background: #fff; border-radius: 20px; max-width: 460px; width: 100%;
    padding: 40px 36px; text-align: center;
    box-shadow: 0 30px 60px -30px rgba(0,0,0,0.5);
  }
  .badge {
    width: 64px; height: 64px; border-radius: 999px; margin: 0 auto 20px;
    display: grid; place-items: center; font-size: 30px; color: #fff;
    background: ${accent};
  }
  h1 { font-size: 22px; margin: 0 0 10px; }
  p { font-size: 15px; line-height: 1.6; color: #475569; margin: 0; }
  .foot { margin-top: 26px; font-size: 12px; letter-spacing: .12em;
    text-transform: uppercase; color: #94a3b8; }
</style>
</head>
<body>
  <main class="card">
    <div class="badge">${mark}</div>
    <h1>${escapeHtml(opts.heading)}</h1>
    <p>${escapeHtml(opts.message)}</p>
    <div class="foot">California Dental Meeting</div>
  </main>
</body>
</html>`;
  return new Response(body, {
    status: opts.status ?? (opts.tone === "success" ? 200 : 400),
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
