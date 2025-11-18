/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 🚫 Disable ESLint blocking production builds
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  typescript: {
    // 🚫 Skip type checking during builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
