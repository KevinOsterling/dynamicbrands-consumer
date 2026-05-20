export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3002'
export const WS_URL = BACKEND_URL.replace(/^http/, 'ws')
export const PULL_INTERVAL_MS = 30_000
