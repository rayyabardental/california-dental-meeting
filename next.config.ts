import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the Stripe SDK out of the server bundle. Bundling it (Turbopack)
  // breaks its HTTP layer at runtime on Vercel (StripeConnectionError even
  // though raw fetch to api.stripe.com works); loading it as a real Node
  // module fixes outbound requests.
  serverExternalPackages: ["stripe"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
