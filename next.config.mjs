/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    // Tree-shakes lucide-react per-icon instead of pulling in the whole barrel file —
    // was showing up as an "Attempted import error" warning and bloating page JS.
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
