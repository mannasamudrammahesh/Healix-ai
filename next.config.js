/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // Only use during deployment if you're sure about your types
  },
  eslint: {
    ignoreDuringBuilds: true, // Only use during deployment if you're sure about your code quality
  },
  experimental: {
    appDir: true,
  }
};

module.exports = nextConfig;
