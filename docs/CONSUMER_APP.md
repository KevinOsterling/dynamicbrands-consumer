# CONSUMER_APP.md — Dynamic Brands Consumer App
*Last updated: May 2026*
*Status: Phase 1 in progress — Dynamic Events inbox built and verified.*

---

## What It Is

The Dynamic Brands Consumer App is a mobile-first web app and full sovereign crypto wallet deeply integrated with the Dynamic Brands loyalty ecosystem. Assets that arrive in it — from brand cashbacks, NFT awards, QR redemptions, or any other source — belong entirely to the consumer with no platform restrictions on use.

No app store download required in Phase 1. Future Phase 3+: smart glasses and VR interfaces.

**Key principle:** The loyalty experience is the entry point. The wallet is the asset.

---

## Repo
`C:\Users\ManiMiranda\dynamicbrands-consumer`
`https://github.com/KevinOsterling/dynamicbrands-consumer`

## Stack
- Framework: Next.js (TypeScript, Tailwind CSS, App Router)
- Wallet: Privy.io (Phase 1: custodial, always exportable)
- Port: 3001
- Backend API: `http://localhost:3002` (dev) / env var `NEXT_PUBLIC_BACKEND_URL`

## Commands
```bash
npm run dev    # Development server on port 3001
npm run build  # Production build
npm run start  # Production server
```

---

## Navigation Structure

| Tab | Screen | Status |
|-----|--------|--------|
| **Events** | Dynamic Events (home) | ✅ Built — mock data |
| **Wallet** | Dynamic Brands Wallet | ⬜ Planned |
| **Map** | Map / AR | ⬜ Planned |
| **DAO** | Brand Governance | ⬜ Planned |
| **AMM** | NFT Market | ⬜ Planned |

---

## Messaging Layer Integration

The Consumer App receives messages through three channels managed by the backend:

| Channel | When | How |
|---------|------|-----|
| WebSocket `/ws?wallet=` | App open | Real-time push to Dynamic Events inbox |
| FCM Push | App closed | Lock screen notification |
| Pull `GET /consumers/:wallet/events` | WebSocket dropped | 30s polling fallback |

### useEventStream hook (`src/hooks/useEventStream.ts`)
Manages all three channels in one hook:
- Connects WebSocket on mount
- Auto-reconnects after 5s on drop
- Switches to 30s Pull polling when WS is down
- Deduplicates events by id
- Exposes: `events`, `connectionState`, `markRead`

### Connection states
| State | Badge | Meaning |
|-------|-------|---------|
| `connecting` | 🟡 pulsing | WS handshake in progress |
| `live` | 🟢 | WS open, real-time active |
| `polling` | 🟡 | WS dropped, Pull fallback active |
| `offline` | ⚫ | No connection |

---

## Message Origins

| senderType | senderName example | Description |
|------------|--------------------|-------------|
| `blockchain` | null | On-chain events (mint, distribution, award) |
| `brand` | "China Wok" | Brand-originated messages via Brand Dashboard |
| `platform` | "Dynamic Brands" | Admin-originated platform messages |
| `consumer` | "@crypto_fan" | C2C — reserved, not yet implemented |

---

## Event Types

| eventType | Icon | Border | Channel |
|-----------|------|--------|---------|
| nft_minted | 🌱 | emerald | ws+fcm |
| cashback_friday | 💰 | red | ws+fcm |
| campaign_award | 🏆 | yellow | ws+fcm |
| dao_proposal | 🗳️ | blue | ws |
| dao_update | 📋 | blue | ws |
| new_brand_nft | 🎁 | emerald | ws+fcm |
| new_brand_campaign | 📣 | purple | ws |
| brand_cashback | 💵 | red | ws+fcm |
| brand_decisions | ⚖️ | blue | ws |
| brand_purchases | 🛍️ | green | ws |
| nft_proximity | 📍 | orange | fcm |
| oracle_event | 🔮 | indigo | ws+fcm |
| tamagotchi_requirement | ⏱️ | orange | fcm |
| consumer_achievement | ⭐ | yellow | ws+fcm |
| nft_on_amm | 📈 | teal | ws |
| audit_requirement_consumer | 📋 | red | fcm |
| platform_new_brand_nft | 🆕 | emerald | ws+fcm |
| vault_threshold | ⚠️ | red | ws+fcm |
| dbnft_distribution | 🪙 | teal | ws |
| audit_requirement_brand | 📋 | red | fcm |
| c2c_message | 💬 | zinc | ws+fcm |

---

## Project Structure
src/
app/
page.tsx              ← Server component — renders EventFeed
components/
EventFeed.tsx         ← 'use client' — owns inbox state, mock data for now
EventCard.tsx         ← Individual event card with Tamagotchi timer
ConnectionBadge.tsx   ← Live / polling / offline indicator
hooks/
useEventStream.ts     ← WS + Pull fallback hook (ready, not yet wired to page)
lib/
types.ts              ← DynamicEvent, EventType, SenderType
config.ts             ← BACKEND_URL, WS_URL, PULL_INTERVAL_MS

---

## Current State (May 2026)
- Next.js app scaffolded and running on port 3001 ✅
- All 21 event types styled with icons and border colors ✅
- Tamagotchi countdown timer and TAP button working ✅
- Sender name displayed per card ✅
- ConnectionBadge showing four states: connecting / live / polling / offline ✅
- useEventStream hook built and wired — WS + 30s poll fallback + 5s reconnect ✅
- Live backend connected at `ws://localhost:3002/ws?wallet=` ✅
- End-to-end live test passed: POST `/admin/messages` → event appears in inbox ✅
- DEV_WALLET hardcoded (`0xa765...`) — Privy.io not yet integrated ⬜
- Privy.io wallet not yet integrated ⬜
- FCM service worker not yet registered ⬜

---

## Next Steps
1. Integrate Privy.io — replace hardcoded DEV_WALLET with real wallet address
2. Register FCM service worker for push notifications when app is closed
3. Build Wallet screen
4. Build bottom navigation (Events / Wallet / Map / DAO / AMM)

---

## Inputs (what the app receives)
All inputs arrive from the Database via Backend API. The Consumer App never reads directly from the blockchain.

| Input | Endpoint |
|-------|----------|
| Dynamic Events feed | WS `/ws?wallet=` or GET `/consumers/:wallet/events` |
| FCM push (app closed) | Firebase → device |
| NFT/wallet balances | Planned — GET `/consumers/:wallet/assets` |
| Map/AR data | Planned |
| AMM market data | Planned |

---

## Outputs (what the app sends)
All outputs go to the Database via Backend API.

| Output | Endpoint |
|--------|----------|
| FCM device token registration | POST `/consumers/:wallet/device-token` |
| Mark event read | PATCH `/consumers/:wallet/events/:id/read` |
| DAO votes | Planned |
| Tamagotchi tap | Planned |
| QR scan events | Planned |

---

## Wallet Technology: Privy.io
- Phase 1: Custodial — Privy.io manages keys. Consumer authenticates with phone or email.
- Always exportable to full self-custody from day one.
- One phone/email = one wallet = all brand NFTs in one place.

---

## Technological Interface Roadmap
| Phase | Interface | Key Features |
|-------|-----------|-------------|
| Phase 1 | Smartphone (mobile web) | QR scan, full wallet, DAO, GPS, Dynamic Events inbox |
| Phase 3+ | Smart glasses | Persistent AR overlay, NFT entities in field of vision |
| Phase 3+ | VR | Virtual brand environments |
| Future | Smartwatch, NFC, IoT | Additional Oracle event sources |
