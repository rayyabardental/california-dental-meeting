import { getSiteUrl } from "@/lib/site-url";

/**
 * schema.org Organization markup describing California Dental Meeting and its
 * ownership by ISADe. `parentOrganization` is what tells search engines the
 * two are one corporate family rather than unrelated brands that happen to
 * co-appear on event pages.
 *
 * Built from static first-party values, stringified and `<` escaped, so there
 * is no injection path.
 */
export function OrganizationJsonLd(): React.ReactElement {
  const site = getSiteUrl();

  const payload = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "California Dental Meeting",
    alternateName: "CDM",
    url: site,
    logo: `${site}/cdm-logo.jpg`,
    email: "ray.yabardental@gmail.com",
    telephone: "+1-951-463-9732",
    description:
      "International continuing-education organization delivering live-patient surgical training and accredited CE programs worldwide.",
    parentOrganization: {
      "@type": "Organization",
      name: "International Society of Advanced Dentistry",
      alternateName: "ISADe",
      logo: `${site}/isade-logo.webp`,
    },
    sameAs: [
      "https://www.instagram.com/californiadentalmeetings",
      "https://www.tiktok.com/@californiadentalmeetings",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, "\u003c"),
      }}
    />
  );
}
