/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        hostname: "images.mid-day.com",
      },
    ],
  },
};

module.exports = nextConfig;
