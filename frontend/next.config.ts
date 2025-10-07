/* eslint-disable @typescript-eslint/no-require-imports */
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",        // nơi chứa service-worker.js build ra
  disable: process.env.NODE_ENV !== "production", // ❗ tắt PWA khi dev
});

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
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

// ✅ Gộp với next-pwa, chỉ export một lần thôi
module.exports = withPWA(nextConfig);
