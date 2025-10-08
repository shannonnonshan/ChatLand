/* eslint-disable @typescript-eslint/no-require-imports */
// next.config.js
const withPWA = require("next-pwa")({
  dest: "public", // nơi chứa service-worker.js build ra
  disable: process.env.NODE_ENV !== "production", // ❗ tắt PWA khi dev
});

const baseConfig = {
  reactStrictMode: true,

  // ✅ Cấu hình hình ảnh kiểu mới (Next.js 15)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "docs.material-tailwind.com",
        port: "",
        pathname: "/**",
      },
    ],
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

// ✅ merge đúng cách với next-pwa, không mất config khác
module.exports = withPWA({
  ...baseConfig,
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV !== "production",
  },
});
