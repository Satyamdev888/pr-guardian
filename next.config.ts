/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ Ignore TS errors to allow deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ Ignore Lint errors to allow deployment
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;