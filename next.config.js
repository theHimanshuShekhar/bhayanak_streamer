/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "images.mid-day.com",
      },
    ],
  },
};

module.exports = nextConfig;
