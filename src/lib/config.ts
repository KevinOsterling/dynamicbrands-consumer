export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3002'
export const WS_URL = BACKEND_URL.replace(/^http/, 'ws')
export const PULL_INTERVAL_MS = 30_000

// Base URL for the QR deep link landing page. Testnet defaults to the local dev server;
// production overrides via env to https://app.dynamicbrands.io/redeem.
export const REDEEM_BASE_URL = process.env.NEXT_PUBLIC_REDEEM_BASE_URL ?? 'http://localhost:3000/redeem'
