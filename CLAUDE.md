@AGENTS.md
<!-- Source of truth: dynamicbrands-consumer/CLAUDE.md -->

## What This Is

Dynamic Brands Consumer App is the mobile-first web wallet for the Dynamic Brands loyalty platform. Consumers use it to receive brand NFTs, collect weekly USDC cashbacks, participate in brand DAOs, and trade on the DB-NFT AMM. The home screen is a real-time Dynamic Events inbox delivered over WebSocket with a polling fallback. The wallet address (Privy.io) doubles as the on-chain address for all NFT, USDC, and AMM activity — no separate wallet app needed.

## Stack

| Dependency | Version | Status |
|---|---|---|
| Next.js | 16 | live |
| React | 19 | live |
| Tailwind CSS | v4 | live |
| TypeScript | 5 | live |
| Privy.io | — | live |
| next-pwa | — | pending |
| next-intl | — | pending |

## Commands

```bash
npm run dev    # dev server on port 3000
npm run build  # production build
npm run start  # production server
```

## Canonical Docs
*Always read these at their canonical path. Never create a local copy.*

| Doc | Canonical Path |
|-----|---------------|
| CONSUMER_APP.md | `C:\Users\ManiMiranda\dynamicbrands-consumer\docs\CONSUMER_APP.md` |
| SYSTEM.md | `C:\Users\ManiMiranda\dynamicbrands-backend\docs\SYSTEM.md` *(external)* |
| ARCHITECTURE.md | `C:\Users\ManiMiranda\dynamicbrands-backend\docs\ARCHITECTURE.md` *(external)* |
| BACKEND.md | `C:\Users\ManiMiranda\dynamicbrands-backend\docs\BACKEND.md` *(external)* |

---

## Reference Docs

| File | Contents |
|---|---|
| `docs/CONSUMER_APP.md` | Full consumer app spec — screens, flows, wallet, map, DAO, AMM |
| `C:\Users\ManiMiranda\dynamicbrands-backend\docs\ARCHITECTURE.md` *(external)* | Backend data flows, DB schema, API endpoints, event mappings |
| `C:\Users\ManiMiranda\dynamicbrands-backend\docs\SYSTEM.md` *(external)* | Full system blueprint, component registry, business cycles |

## Current State

| Feature | Status |
|---|---|
| Dynamic Events inbox | ✅ complete |
| PWA manifest | ✅ complete |
| Bottom nav | ✅ complete |
| Privy.io wallet integration | ✅ complete |
| Wallet screen | ✅ complete |
| DAO screen | ✅ complete (on-chain voting Phase 2) |
| AMM screen | ⬜ stub only |
| Map screen | ⬜ Phase 2 — not in current nav |

## Session Setup

- Tab 1: Claude Code (this session)
- Tab 2: `npm run dev` — http://localhost:3000
