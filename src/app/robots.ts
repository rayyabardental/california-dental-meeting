import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Transactional / stateful / admin-only pages have no SEO value.
        disallow: ["/api/", "/cart", "/checkout", "/admin"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
