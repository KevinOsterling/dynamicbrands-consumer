@AGENTS.md
<!-- Source of truth: dynamicbrands-consumer/CLAUDE.md -->

## What This Is

Dynamic Brands Consumer App is the mobile-first web wallet for the Dynamic Brands loyalty platform. Consumers use it to receive brand NFTs, collect weekly USDC cashbacks, participate in brand DAOs, and trade on the DB-NFT AMM. The home screen is a real-time Dynamic Events inbox delivered over WebSocket with a polling fallback. The wallet address (Privy.io, pending) doubles as the on-chain address for all NFT, USDC, and AMM activity — no separate wallet app needed.

## Stack

| Dependency | Version | Status |
|---|---|---|
| Next.js | 16 | live |
| React | 19 | live |
| Tailwind CSS | v4 | live |
| TypeScript | 5 | live |
| Privy.io | — | pending |
| next-pwa | — | pending |
| next-intl | — | pending |

## Commands

```bash
npm run dev    # dev server on port 3000
npm run build  # production build
npm run start  # production server
```

## Reference Docs

| File | Contents |
|---|---|
| `docs/CONSUMER_APP.md` | Full consumer app spec — screens, flows, wallet, map, DAO, AMM |
| `docs/ARCHITECTURE.md` | Mirror — backend data flows, DB schema, API endpoints, event mappings |
| `docs/SYSTEM.md` | Mirror — full system blueprint, component registry, business cycles |

## Current State

| Feature | Status |
|---|---|
| Dynamic Events inbox | ✅ complete |
| PWA manifest | ✅ complete |
| Bottom nav | ✅ complete |
| Wallet / DAO / AMM screens | ⬜ stub only |
| Map screen | ⬜ Phase 2 — not in current nav |
| Privy.io wallet integration | ⬜ pending |

## Session Setup

- Tab 1: Claude Code (this session)
- Tab 2: `npm run dev` — http://localhost:3000
