import type { NextConfig } from "next";

// Dev-only: hosts allowed to reach Next.js dev resources cross-origin
// (e.g. cloudflared tunnel hosts for mobile testing). Comma-separated, no scheme.
const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
};

export default nextConfig;
