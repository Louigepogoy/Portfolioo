/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets the frontend import ../shared/portfolio.json as an offline fallback.
  experimental: { externalDir: true },
};

export default nextConfig;
