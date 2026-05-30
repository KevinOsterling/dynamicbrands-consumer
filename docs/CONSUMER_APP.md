<!-- Source of truth: dynamicbrands-consumer/docs/CONSUMER_APP.md -->
# CONSUMER_APP.md — Dynamic Brands Consumer App
*Last updated: 2026-05-30*
*Status: Phase 1 in progress — Events inbox complete, bottom nav built, stub screens added.*

---

## What It Is

The Dynamic Brands Consumer App is a mobile-first web app and full sovereign crypto wallet deeply integrated with the Dynamic Brands loyalty ecosystem. Assets that arrive in it — from brand cashbacks, NFT awards, QR redemptions, or any other source — belong entirely to the consumer with no platform restrictions on use.

No app store download required in Phase 1. Future Phase 3+: smart glasses and VR interfaces.

**Key principle:** The loyalty experience is the entry point. The wallet is the asset.

---

## Consumer Onboarding Flow

| Step | Event | What Happens |
|------|-------|--------------|
| 1 | Discovery | Consumer encounters QR code (packaging, VISA voucher, landing page, social, AR character) |
| 2 | Scan | QR redirect opens Consumer App in browser — no download required |
| 3 | Auth | Consumer authenticates via phone or email → Privy.io creates custodial wallet |
| 4 | Mint | App calls `BrandNFT.redeemQR()` → NFT minted on-chain to consumer's wallet |
| 5 | Inbox | Consumer enters Dynamic Events inbox — first `nft_minted` notification received |

---

## Repo
`C:\Users\ManiMiranda\dynamicbrands-consumer`
`https://github.com/KevinOsterling/dynamicbrands-consumer`

## Stack
- Framework: Next.js 16, React 19, Tailwind v4, TypeScript
- Wallet: Privy.io (Phase 1: custodial, always exportable) — pending integration
- Port: 3000 (default)
- Backend API: `http://localhost:3002` (dev) / env var `NEXT_PUBLIC_BACKEND_URL`

## Commands
```bash
npm run dev    # Development server on port 3000
npm run build  # Production build
npm run start  # Production server
```

---

## Navigation Structure

Bottom nav (`src/components/BottomNav.tsx`) is built and wired. Four tabs in Phase 1:

| Tab | Icon | Route | Status |
|-----|------|-------|--------|
| **Events** | 📬 | `/` | ✅ Complete — live backend |
| **Wallet** | 💳 | `/wallet` | ⬜ Stub only |
| **DAO** | 🗳️ | `/dao` | ⬜ Stub only |
| **AMM** | 📈 | `/amm` | ⬜ Stub only |

Map screen is architecturally planned (see SYSTEM.md) but not in the current nav — will be added when Map/AR work begins.

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
- Connects WebSocket on mount; backend push envelope: `{type:"dynamic_event",event:{...}}`
- Auto-reconnects after 5s on drop
- Switches to 30s Pull polling when WS is down; pull response: `{events:[...]}`
- Calls `fetchMissed()` on every reconnect to catch events from the disconnect gap
- Deduplicates events by id across both channels
- `mountedRef` guard prevents setState calls after unmount
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
| welcome | 🎉 | emerald | ws+fcm | Brand-facing — platform → brand manager |
| c2c_message | 💬 | zinc | ws+fcm |

---

## Project Structure
```
src/
  app/
    layout.tsx            ← Root layout — metadata, fonts, BottomNav
    page.tsx              ← Server component — renders EventFeed
    manifest.ts           ← PWA manifest (Next.js 16 MetadataRoute.Manifest)
    wallet/page.tsx       ← Stub — "Coming soon"
    dao/page.tsx          ← Stub — "Coming soon"
    amm/page.tsx          ← Stub — "Coming soon"
  components/
    BottomNav.tsx         ← 'use client' — 4-tab fixed bottom nav, active tab blue
    EventFeed.tsx         ← 'use client' — connects to useEventStream, renders live events
    EventCard.tsx         ← Individual event card with Tamagotchi timer
    ConnectionBadge.tsx   ← connecting / live / polling / offline indicator
  hooks/
    useEventStream.ts     ← WS + Pull fallback + reconnect, wired to EventFeed
  lib/
    types.ts              ← DynamicEvent, EventType, SenderType
    config.ts             ← BACKEND_URL, WS_URL, PULL_INTERVAL_MS
```

---

## Current State (May 2026)
- Next.js 16 / React 19 / Tailwind v4 app running on port 3000 ✅
- PWA manifest configured (`src/app/manifest.ts`) — name "Dynamic Brands", dark zinc theme ✅
- Bottom nav built — 4 tabs (Events / Wallet / DAO / AMM), active tab blue, fixed bottom ✅
- Stub pages for Wallet / DAO / AMM ✅
- All 21 event types styled with icons and border colors ✅
- Tamagotchi countdown timer and TAP button working ✅
- Sender name displayed per card ✅
- ConnectionBadge showing four states: connecting / live / polling / offline ✅
- **Live WebSocket inbox complete — end-to-end verified** ✅
  - WS push envelope `{type:"dynamic_event",event:{...}}` correctly unwrapped ✅
  - Poll response `{events:[...]}` correctly unwrapped ✅
  - mountedRef guards prevent setState after unmount ✅
  - fetchMissed() on reconnect catches events from the disconnect gap ✅
  - POST `/admin/messages` → event appears in inbox instantly, no page refresh ✅
- Date formatter hydration mismatch fixed (useEffect + useState, empty string SSR fallback) ✅
- DEV_WALLET=`0xa765a9D996636F608932b29a2889329fC30C3e1a` hardcoded in `EventFeed.tsx` — replace with Privy wallet when integrated ⬜
- Privy.io wallet not yet integrated ⬜
- FCM service worker not yet registered ⬜
- All UI text is Spanish (es-PE) — hardcoded, no i18n routing yet ⬜
- Map screen not yet in nav — planned for Phase 2 ⬜

---

## Next Steps
1. Integrate Privy.io — replace hardcoded DEV_WALLET with real wallet address
2. Register FCM service worker for push notifications when app is closed
3. Build Wallet screen content (NFT balances, USDC balance, transaction history)
4. Build DAO screen content (proposal list, voting)
5. Build AMM screen content (NFT market listings)
6. Add Map tab to nav when Map/AR work begins

---

## Inputs (what the app receives)
All inputs arrive from the Database via Backend API. The Consumer App never reads directly from the blockchain.

| Input | Source | Status |
|-------|--------|--------|
| Dynamic Events feed | WS `/ws?wallet=` or GET `/consumers/:wallet/events` | ✅ Live |
| FCM push (app closed) | Firebase → device | ⬜ Service worker pending |
| NFT/wallet balances (Phase 1: Base assets only) | Planned — GET `/consumers/:wallet/assets` | ⬜ Not yet built |
| Multi-chain asset display (Phase 2+: Bitcoin, ETH, others) | Multi-chain portfolio API — provider TBD | ⬜ Future |
| Map/AR geolocation data | Oracle API → Backend | ⬜ Future |
| AMM market listings | Planned | ⬜ Phase 2 |

---

## Outputs (what the app sends)
All outputs go to the Database via Backend API.

| Output | Endpoint | Status |
|--------|----------|--------|
| FCM device token registration | POST `/consumers/:wallet/device-token` | ✅ Live |
| Mark event read | PATCH `/consumers/:wallet/events/:id/read` | ✅ Live |
| Mark all events read | PATCH `/consumers/:wallet/events/read-all` | ✅ Live |
| DAO votes and proposals | Planned | ⬜ Future |
| Tamagotchi tap | Planned — POST `/consumers/:wallet/tamagotchi/tap` | ⬜ Future |
| QR scan events (NFT redemption) | On-chain via `BrandNFT.redeemQR()` → Backend listener catches it | ⬜ Future |
| AMM trade instructions | Planned | ⬜ Phase 2 |

---

## Wallet Technology: Privy.io

**Phase 1 — Custodial (pending integration):**
- Privy.io manages private keys on behalf of the consumer
- Consumer authenticates with phone number or email — no seed phrase required
- Keys are always exportable to full self-custody from day one — no platform lock-in
- One phone/email = one wallet = all brand NFTs in one place

**Progressive custody path:**
- Day 1: Privy.io custodial (zero friction for new crypto users)
- Day N: Consumer exports keys to any self-custody wallet (MetaMask, Ledger, etc.)
- The wallet address never changes — all assets remain in place

**Phase 1 assets (Base chain only):**
- Brand NFTs (ERC-1155)
- USDC cashbacks
- DB-NFTs

**Phase 2+ assets (multi-chain via portfolio API — provider TBD):**
- Bitcoin, ETH, and other chains displayed in-app
- External wallets linkable for read-only balance display

---

## Technological Interface Roadmap
| Phase | Interface | Key Features |
|-------|-----------|-------------|
| Phase 1 | Smartphone (mobile web) | QR scan, full wallet, DAO, GPS, Dynamic Events inbox |
| Phase 3+ | Smart glasses | Persistent AR overlay, NFT entities in field of vision |
| Phase 3+ | VR | Virtual brand environments |
| Future | Smartwatch, NFC, IoT | Additional Oracle event sources |

---

## Migrated from dashboard version — review and integrate

*The following sections existed in the dashboard repo's CONSUMER_APP.md (April 2026) but were absent from this file. Review each block and merge or discard as appropriate.*

---

### Screen Specifications

#### Dynamic Events (Home / Inbox)
A rich event inbox — like email. Everything relevant to the consumer in one feed.

**Event types (examples — not exhaustive):**
- **Brand web option** — brand announcements, e.g. a brand giving away NFTs on their website or elsewhere
- **DAO proposal** — new governance proposal from a brand the consumer holds
- **Oracle event** — external event relevant to an active campaign
- **Brand cashback** — Friday distribution confirmation and amount received
- **User Award** — campaign condition met, award received
- **Brand/s campaign** — new campaign launched by a brand the consumer holds
- **User event** — anything a user (themselves or another) did that is relevant to their active campaigns
- **New NFTs** — new NFT types or availability relevant to the consumer

**Tamagotchi mechanic lives here:** Individual inbox messages can contain a tap button with a countdown timer. Consumer must open the message and tap within the time window (24–48h to open, 10 seconds to complete once opened) or lose the reward / drop a tier. The action is intentionally trivial — the cost is in forgetting, not in effort.

**Future:** Consumer may be able to filter which brands' events appear in their inbox.

---

#### Wallet (Dynamic Brands Wallet)
A full sovereign crypto wallet displaying ALL assets held by the consumer regardless of source.

**Asset grid:**
- One tile per brand NFT held (displays brand logo/image)
- One tile per crypto asset held (USDC, Bitcoin, others)
- Tapping a brand NFT tile → detail view: NFT balance, APY, cashback history, total earned, DAO participation, campaign eligibility
- USDC tile → total USDC balance across all sources (source is irrelevant — it is the consumer's money)

**Sovereignty principle:** USDC can buy more NFTs on the DB AMM, be sent to any external address, or be used entirely outside Dynamic Brands. Bitcoin and other crypto assets are equally unrestricted.

**AMM access:** The AMM tab is always reachable — consumer can go buy more NFTs at any time directly from their portfolio.

**APY display principle:** "Total USDC Earned" (cumulative, all-time) is the most emotionally powerful metric. Always display it prominently. A consumer who has earned $4.73 over 3 months feels fundamentally different than one who "earned $0.03 this week."

---

#### Map
Geolocation view of the physical world overlaid with Dynamic Brands events.

- Location pins marking active brand events, Oracle events, AR entity positions
- Consumer navigates to pin locations to participate in location-based campaigns
- Foundation for the Living NFT / Ostrich scenario: entities visible on map before catchable in AR

---

#### DAO
Brand governance interface.

- Active proposals from brands the consumer holds
- Voting (YES/NO, weighted by NFT balance)
- Consumer's own proposal submission
- Contribution history — proposals submitted, votes cast, rewards earned from implemented proposals

---

#### AMM
Direct access to the DB NFT AMM.

- Buy brand NFTs (primary market from brands, secondary from other consumers)
- Sell brand NFTs
- View pricing and liquidity
- All transactions settle through the consumer's in-app wallet address

---

### The App IS the Wallet (use cases)

The Privy.io-powered wallet address embedded in the app is the address used for:
- Receiving brand NFTs from QR/AR redemptions
- Receiving USDC cashback distributions
- Receiving campaign awards
- Sending assets to the DB AMM for trading
- Receiving assets back from the DB AMM
- Any external crypto transaction the consumer initiates

No separate wallet app needed.

---

### How the Wallet Reads Crypto Balances

A crypto wallet does not store balances — it holds the private key and queries the blockchain to read what is at that address.

**Phase 1 — Base assets only:**
Consumer App reads balances via the Backend API, which queries Base through our existing paid RPC provider. Covers all Phase 1 assets: brand NFTs, USDC, DB-NFTs. The Consumer App never calls RPC directly.

**Phase 2+ — Multi-chain (pending architectural decision):**
Showing Bitcoin, Ethereum, or other non-Base assets requires a multi-chain RPC provider or portfolio API (e.g., QuickNode multi-chain, Alchemy Portfolio API). Deferred to Phase 2+.

**Design principle:** The wallet UI is designed from day one to show all crypto assets. Phase 1 only populates Base assets. Non-Base tiles appear when multi-chain RPC is added. The UI north star does not change — only data availability does.

---

### Architectural Notes

- Separate project from the Brand Intranet — different repo, deployment, and tech stack.
- Wallet holds ALL crypto assets, not just Dynamic Brands-originated ones. Schema and API must support arbitrary asset types.
- Map/AR/VR screens must be architecturally reserved from Phase 1. Build Phase 1 so the Ostrich is possible.
- Consumer identity (phone/email → wallet address) must be consistent across all touchpoints.
