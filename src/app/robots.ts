import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Transactional / stateful pages have no SEO value.
        disallow: ["/api/", "/cart", "/checkout"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
