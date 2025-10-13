/* eslint-disable @typescript-eslint/no-require-imports */
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public", // nơi chứa service-worker.js build ra
  disable: process.env.NODE_ENV !== "production", // ❗ tắt PWA khi dev
});
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['picsum.photos'], // <--- thêm hostname bạn muốn dùng
  },
};

const baseConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "docs.material-tailwind.com",
        port: "",
        pathname: "/**",
      },
    ],
    domains: ['upload.wikimedia.org', 'cdn-icons-png.flaticon.com'],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

// ✅ Chỉ merge baseConfig, không thêm pwa nữa
module.exports = withPWA(baseConfig);
