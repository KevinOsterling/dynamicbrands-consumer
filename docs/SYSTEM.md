<!-- Mirror of: dynamicbrands-backend/docs/SYSTEM.md — do not edit here -->
# SYSTEM.md — Dynamic Brands Master Architecture
*Last updated: 2026-05-30 | Read this first at the start of every session.*
*For implementation detail, follow the links in each component section.*

---

## What We Are Building

Dynamic Brands is a tokenization PaaS enabling Latin American brands to issue Living NFTs to consumers via QR codes and other touchpoints. Three consumer value pillars: **Ownership & Yield** (weekly USDC cashback), **Governance** (DAO voting), **Utility** (NFTs as currency at brand outlets).

**The platform has three separate frontend applications:**
```
dynamicbrands.io           ← Marketing landing page (future)
app.dynamicbrands.io       ← Brand Intranet / Manager Dashboard ← BUILDING NOW
[brand].dynamicbrands.io   ← Consumer App (future, separate mobile-first project)
```

---

## System Architecture Map
```
┌─────────────────────────────────────────────────────────────────────┐
│  USERS                                                              │
│  ┌──────────────────────┐          ┌──────────────────────────────┐ │
│  │ CONSUMERS            │          │ BRANDS                       │ │
│  │ (QR, AR, VR,         │          │ (Marketing, Finance,         │ │
│  │  Social, VISA)       │          │  Stakeholders)               │ │
│  └──────────┬───────────┘          └──────────────┬───────────────┘ │
└─────────────┼─────────────────────────────────────┼─────────────────┘
              │                                      │
┌─────────────┼─────────────────────────────────────┼────────────────┐
│  FRONT END  │                                      │                │
│  ┌──────────▼───────────┐          ┌──────────────▼───────────────┐ │
│  │ CONSUMER APP         │          │ BRAND INTRANET               │ │
│  │ Dynamic Events,      │          │ Create NFT, Create Campaign, │ │
│  │ Wallet, Map,         │          │ Dashboard, Decisions,        │ │
│  │ DAO, AMM             │          │ Cashbacks, Purchases, AMM    │ │
│  └──────────┬───────────┘          └──────────────┬───────────────┘ │
└─────────────┼─────────────────────────────────────┼────────────────┘
              │                                      │
┌─────────────┼─────────────────────────────────────┼────────────────┐
│  BACK END   │                      ┌───────────────┘                │
│             │            ┌─────────▼──────────────────────┐         │
│             │◄──────────►│           DATABASE              │         │
│             │            │  (Central hub — all reads       │         │
│  ┌──────────┘            │   and writes flow through here) │         │
│  │                       └──┬──────────────────────────┬───┘         │
│  │  ┌────────────────────┐  │                          │             │
│  │  │ ORACLE APIs        │  │  ┌───────────────────┐  │             │
│  │  │ (Third-party:      ├──►  │  BACK OFFICE      │◄─┘             │
│  │  │  AR, VR, Social,   │  │  │  (AI Agents)      │               │
│  │  │  Others)           │  │  └───────────────────┘               │
│  │  └────────────────────┘  │           │ Internet                  │
│  │                          │  ┌────────▼──────────┐               │
│  │                          │  │  DB NFT AMM        │               │
│  │                          └─►│  (Dynamic Brands   │               │
│  │                             │   NFT Market)      │               │
│  │                             └───────────────────┘               │
└──┼─────────────────────────────────────────────────────────────────┘
   │
┌──▼──────────────────────────────────────────────────────────────────┐
│  BLOCKCHAIN (Base / Base Sepolia testnet)                           │
│                                                                     │
│  ┌────────────┐ ┌──────────┐ ┌────────────────────┐ ┌───────────┐  │
│  │ BrandNFT   │ │ BrandDAO │ │ DistributionVault  │ │ Campaign  │  │
│  │            │ │          │ │ + DB NFT           │ │ Engine    │  │
│  └────────────┘ └──────────┘ └────────────────────┘ └───────────┘  │
│  ┌────────────────────────────┐  ┌──────┐  ┌──────┐                │
│  │ DynamicBrandsRegistry      │  │ USDC │  │ IPFS │                │
│  └────────────────────────────┘  └──────┘  └──────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Registry

### USERS

#### Consumers
Individuals who interact with brand NFTs through physical and digital touchpoints.

**Onboarding touchpoints:**
- QR codes on brand product packaging
- QR codes on the Dynamic Brands web landing page (placed by Brands)
- QR codes on VISA sales vouchers (via VISA APIs, with brand consent)
- AR characters catchable in AR/VR experiences (via AR/VR service APIs configured by Brands)
- QR codes embedded in social networks (via social network APIs configured by Brands)

**INPUT from Database:** QR code identifiers and all necessary data to render the onboarding experience in the Consumer App.
**OUTPUT to Consumer App:** Interaction with all touchpoints generates events (QR scans, AR catches, etc.) that flow into the Consumer App and then to the Database.

#### Brands
Marketing, finance, or any stakeholder using Dynamic Brands on behalf of their brand.

**INPUT:** Full Dynamic Brands UX through the Brand Intranet. Later: DB-NFTs and weekly cashbacks.
**OUTPUT to Database → Blockchain:** NFT configuration data and Campaign configuration data. Weekly USDC cashback deposits sent directly to their brand's `DistributionVault + DB NFT` contract.

#### Oracle APIs (Third-Party)
External servers whose data is treated as valid events for Dynamic Brands Campaigns. AR platforms, VR platforms, social networks, and others. **Dynamic Brands does not own or control these.**

**INPUT from Back Office:** Campaign configuration data specifying which events to watch for.
**OUTPUT to Database:** Validated events relevant to active Brand Campaigns.
**Trust model:** Oracle events are validated and stored at the Database level — not written on-chain. Oracle trust is a platform governance decision enforced at the Database and Back Office level.
**Status:** Architecturally reserved. Specific integrations undefined. Database schema and Backend ingestion endpoint must be ready to receive Oracle events without requiring a retrofit.

---

### FRONT END

#### Consumer App
The Consumer App is a **full sovereign crypto wallet** deeply integrated with the Dynamic Brands loyalty ecosystem. Mobile-first web app. Future Phase 3+: smart glasses and VR interfaces.
*See `dynamicbrands-consumer/docs/CONSUMER_APP.md` for full spec.*

**The app IS the wallet.** The Privy.io-powered wallet address in the app is the same address used for receiving NFTs, cashbacks, awards, AMM trades, and any external crypto transaction. No separate wallet app needed.

**Navigation tabs:** Events (home), Wallet, DAO, AMM. Map is Phase 2 — not in Phase 1.

**Wallet holds ALL assets** — brand NFTs, DB-NFTs, USDC, Bitcoin, and any other crypto. Assets are sovereign: no platform restrictions on how the consumer uses their money.

**Wallet technology:** Privy.io (Phase 1 custodial, always exportable to self-custody from day one).

**Phase 1:** Base assets only (brand NFTs, USDC, DB-NFTs) via Backend API → paid RPC.
**Phase 2+:** Multi-chain asset display (Bitcoin, ETH, others) via multi-chain portfolio API — pending provider decision.

**INPUT from Database:** Dynamic Events feed (all inbox event types including Tamagotchi actions), NFT giveaway confirmations, wallet asset balances, map/geolocation data, AMM market data.

**OUTPUT to Database:** All consumer-generated events evaluable as campaign conditions — QR scans, Tamagotchi taps, DAO votes and proposals, AR interactions, location presence, purchases, user events, AMM trade instructions, external wallet transfers.

**Status:** ⚠️ Phase 1 in progress — Events feed, Wallet, DAO tabs live. Map is Phase 2.

#### Brand Intranet (Dashboard)
Web application for brand managers. Currently the active build target.
*See `docs/FRONTEND.md` and `docs/DESIGN.md` for implementation detail.*

**Screens:** Create NFT, Create Campaign, Dashboard, Decisions, Cashbacks, Purchases, AMM.

**INPUT from Brands:** NFT configuration and Campaign configuration data entered by brand managers.

**OUTPUT to Database → Blockchain:** All configuration data flows first to the Database, which then propagates necessary instructions to the relevant smart contracts on the blockchain.

**Current build state:** See `dynamicbrands-dashboard/CLAUDE.md` for page-by-page status.

---

### BACK END

#### Database
The central hub of the entire platform. All reads and writes across every component flow through the Database via the Backend API. It stores raw data from multiple sources and also infers, calculates, and generates new data.
*See `docs/BACKEND.md` and `docs/ARCHITECTURE.md` for schema, API endpoints, and service architecture.*

**INPUT from:** Brand Intranet, Consumer App, Oracle APIs, Back Office AI Agents, DB NFT AMM, all Blockchain smart contracts (via viem listener).

**OUTPUT to:** Consumer App, Brand Intranet, Oracle APIs, Back Office AI Agents, DB NFT AMM, all Blockchain smart contracts.

**Inferred / generated data (examples — not exhaustive):**
- Unique holder count per brand (derived from transfer events, stored locally)
- APY calculations (running totals cached per consumer per brand)
- Consumer reputation scores (computed from multiple on-chain and off-chain signals)
- Campaign analytics (impressions, conversions, total rewards paid)
- Business intelligence per brand (campaign intelligence, consumer scoring, real-time decisions)
- Consumer wallet asset balances (Phase 1: Base assets only via paid RPC; Phase 2+: multi-chain via portfolio API)

**Current state:** Node.js/TypeScript, Fastify, Prisma, PostgreSQL (Supabase). 14 models live. viem listener active.

#### Back Office (AI Agents)
AI agents acting as Dynamic Brands' internal employees. Connected bidirectionally to the Database only. Uses the Internet as a resource.
*See `docs/BACKOFFICE.md` for agent definitions.*

**Agents:** User Acquisition, Onboarding, Backend Operations, Business Intelligence per Brand, Incentives.
**Connection:** Database ↔ Back Office ↔ Internet. No direct blockchain connection.
**Status:** Future. Database must be ready to serve and receive agent calls without retrofit.

#### DB NFT AMM
Dynamic Brands' on-chain NFT Marketplace. Fixed-price primary and secondary market for all brand NFTs including DB-NFTs.
*See `dynamicbrands/docs/AMM.md` for full spec.*

**Architecture:** On-chain upgradeable smart contract (TransparentUpgradeableProxy). Sellers list NFTs at a fixed USDC price; NFT stays in seller's wallet until `buyItem()` executes an atomic swap: USDC → seller, NFT → buyer, 2.5% fee to Dynamic Brands treasury. No custody of assets by Dynamic Brands.

**Proxy address is permanent:** Consumers approve the proxy address once via `setApprovalForAll`. The address never changes across logic upgrades — no consumer re-approval needed when V2 or V3 is deployed.

**Connection:** Backend listener watches proxy address for `ListingCreated`, `ListingCancelled`, `PriceUpdated`, `TradeExecuted` events → syncs to `amm_listings` and `amm_trades` tables.
**Status:** Design complete (`NFTMarketplace.sol`, `NFTMarketplaceProxy.sol`, `deploy_marketplace.ts`). Not yet deployed. Phase 2.

---

### BLOCKCHAIN
*See `dynamicbrands/docs/CONTRACTS.md` for ABIs, addresses, and function-level detail.*
*See `docs/BLOCKCHAIN.md` for wagmi/viem integration patterns.*

All contracts deployed on **Base** (mainnet) / **Base Sepolia** (testnet, current). Chain ID: 84532.

#### BrandNFT (one per brand)
ERC-1155. Mints and tracks consumer NFT ownership per brand.
**Current address (China Wok, Base Sepolia):** `0xc06eB97a6D47eB4bE29448a126096B8dF7858e74`

#### DistributionVaultV2 (one per brand)
Holds brand USDC deposits and executes weekly cashback distributions.

**What it does:**
1. Holds USDC deposited by the Brand
2. Distributes USDC cashbacks proportionally to brand NFT holders (weekly, every Friday)
3. Collects 5% platform fee ON TOP of each distribution (Option B — consumers always receive the full advertised amount; brands pay cashback + 5% separately)
4. Routes 5% fee to DB-NFT holder fee pool (USDC yield for DB-NFT holders)
5. Mints 1 DB-NFT to the Brand for every USDC distributed as cashback
6. Before minting, checks DynamicBrandsRegistry for the global 21MM DB-NFT cap

**The promotion mechanic is on-chain:** Contract address is publishable so anyone — including AI agents — can verify brands are genuinely rewarded for distributing cashbacks.

**Current address (China Wok, Base Sepolia):** `0xedfb20429db228ceeaa573ab5560ec346cb02a2a`
**Status:** ✅ Live on Base Sepolia.

#### DynamicBrandsRegistry (shared across all brands)
Protocol-level contract. Shared identity and accounting layer.

**Responsibilities:**
- Registry of all brands and their contract addresses
- Consumer cross-brand identity (wallet → all brands held)
- **Global DB-NFT mint counter** — tracks total minted toward 21MM hard cap
- **Global DB-NFT distribution log** — which brands received how many DB-NFTs
- Authorization logic

**Current address (Base Sepolia):** `0xb0D62f9a32335826Bc111a1722DEBc2d3c53e80f` ← needs update for DB-NFT counter
**Status:** Needs update for DB-NFT accounting. Phase 1.

#### BrandDAO (one per brand)
Governance contract. Records proposals and votes on-chain.
**Current address (China Wok, Base Sepolia):** `0xcd31F908c7c6addF40f0f75E5AcC50B1568aF985`

#### CampaignEngine (shared across all brands)
On-chain composable rules engine. Evaluates IF/THEN campaign conditions and executes awards.
**Current address (Base Sepolia):** `0x1F98680ca5Ff660413709AB67c6fAb05acf697d7`

#### DBNFTToken (Dynamic Brands NFT)
Dynamic Brands' own platform NFT. ERC-1155, 6 decimals, TOKEN_ID=1. Hard cap: 21,000,000 DB-NFTs (21 trillion micro-units). Genesis mint: 7,000,000 to Dynamic Brands treasury at deployment. Ongoing: 1 DB-NFT per USDC distributed by any brand. DB-NFT holders receive 5% platform fee yield in USDC.
**Current address (Base Sepolia):** `0xd07a3579134fbac5d614cb813e73b5105deb20ae`
**Status:** ✅ Live on Base Sepolia. DistributionVaultV2 is authorized to mint.

#### NFTMarketplace (shared across all brands)
Fixed-price on-chain marketplace for ERC-1155 brand NFTs. TransparentUpgradeableProxy — proxy address is permanent and never changes across logic upgrades. Sellers list NFTs; buyers execute atomic USDC↔NFT swaps. 2.5% platform fee to Dynamic Brands treasury.
**Source:** `contracts/NFTMarketplace.sol` + `contracts/NFTMarketplaceProxy.sol`. Deploy script: `scripts/deploy_marketplace.ts`.
**Status:** Design document — not yet deployed. Deploy after Privy.io integration is live.

#### Supporting
- **MockUSDC (testnet only):** `0xf835022e1eFa91B4148890676950F7b0dc0c65B9`
- **Deployer/Oracle/Scheduler wallet:** `0xa765a9D996636F608932b29a2889329fC30C3e1a`
- **IPFS:** Future — NFT metadata storage. Architecturally reserved.

---

## The 7 Business Cycle Flows

| # | Flow | From → To | Description |
|---|------|-----------|-------------|
| 1 | Configuration | Brands → Intranet → Database → Blockchain | Brand managers configure NFTs and Campaigns |
| 2 | Brand NFTs Giveaway | Database → Consumer App → Consumer | QR/AR redemption triggers NFT mint |
| 3 | Cashbacks | Brands → DistributionVault → NFT Holders | Weekly USDC distribution to all NFT holders |
| 4 | DB-NFTs & Cashbacks | DistributionVault → Brands + DB-NFT Holders | 1 DB-NFT per USDC distributed; 5% fee yield to DB-NFT holders |
| 5 | Events | Oracle APIs + Consumer App → Database → CampaignEngine | Third-party and consumer events evaluated as campaign conditions |
| 6 | Awards | CampaignEngine → Consumer App → Consumer | Awards (NFTs and/or USDC) distributed when campaign conditions met |
| 7 | Buying Brand NFTs | Consumer/Brand → DB NFT AMM → Database → Blockchain | Primary and secondary market trading via Dynamic Brands AMM |

---

## Architectural Principles

1. **On-chain is source of truth for ownership and financial data.** Off-chain Database is the hub for everything else. When conflict exists, on-chain wins.
2. **Database is the central mediator.** All components communicate through the Database API. No component except smart contracts talks directly to the blockchain.
3. **Oracle events are validated off-chain.** Third-party data is stored in the Database, not written on-chain by us.
4. **Consumer receives the full advertised cashback amount.** The 5% platform fee is always charged on top, never deducted from the consumer's share.
5. **Build Phase 1 so the Ostrich is possible.** Every decision must leave the door open for AR events, geolocation Oracles, proximity detection, and smart glasses in Phase 3+.
6. **The DB-NFT promotion mechanic is trustless.** The contract enforces it — not just marketing. The contract address is publishable as proof.
7. **The Consumer App is a sovereign wallet.** Assets in it are the consumer's — no platform restrictions on use.

---

## Current Build Status

| Component | Status |
|-----------|--------|
| BrandNFT contract | ✅ Live on Base Sepolia |
| DistributionVaultV2 contract | ✅ DistributionVaultV2 deployed at 0xedfb20429db228ceeaa573ab5560ec346cb02a2a |
| DynamicBrandsRegistry | ⚠️ Live but needs DB-NFT counter update |
| BrandDAO contract | ✅ Live on Base Sepolia |
| CampaignEngine contract | ✅ Live on Base Sepolia |
| DBNFTToken contract | ✅ Live on Base Sepolia — `0xd07a3579134fbac5d614cb813e73b5105deb20ae` |
| Brand Intranet (Dashboard) | ✅ 7 pages + admin panel live, connected to Base Sepolia |
| Backend service | ✅ Fastify + Prisma + Supabase live, viem listener active |
| Consumer App | ⚠️ Phase 1 in progress — Events feed, Wallet, DAO tabs live |
| NFTMarketplace contract | ⬜ Design complete — not yet deployed (Phase 2) |
| DB NFT AMM (full) | 🔲 Phase 2 — deploy after Privy integration |
| Back Office AI Agents | 🔲 Not yet built — Future |
| Oracle API integrations | 🔲 Not yet built — architecture reserved |

---

## Reference Docs

| File | Read when… |
|------|-----------|
| `docs/ARCHITECTURE.md` | Working on backend data flows, DB schema, API endpoints, event mappings |
| `dynamicbrands/docs/CONTRACTS.md` | Contracts reference (external repo) — ABIs, addresses, function signatures |
| `docs/BLOCKCHAIN.md` | Writing wagmi/viem code, transaction flows, wallet connection, critical rules |
| `docs/FRONTEND.md` | Working on any Next.js page, component, routing, i18n, or styling |
| `docs/DESIGN.md` | Working on UI components, colors, Three Circles visual system |
| `docs/BACKEND.md` | Working on backend service runtime, commands, environment config |
| `dynamicbrands-consumer/docs/CONSUMER_APP.md` | Working on or designing the consumer-facing mobile app |
| `docs/ORACLE.md` | Working on Oracle event pipeline or third-party API integrations |
| `dynamicbrands/docs/AMM.md` | Working on the DB NFT Automated Market Maker — proxy architecture, events, schema |
| `C:\Users\ManiMiranda\dynamicbrands\contracts\` | Reading or editing Solidity source files |
| `docs/BACKOFFICE.md` | Working on or designing the AI Agents back office layer |

---

## Documentation File Map — Absolute Paths
*Claude Code must read this before touching any .md file.
Never create a new .md file if one with that name already exists anywhere in this map.
Always edit the existing file in place.*

| File | Full Path on Disk |
|------|-------------------|
| SYSTEM.md | `C:\Users\ManiMiranda\dynamicbrands-backend\docs\SYSTEM.md` |
| ARCHITECTURE.md | `C:\Users\ManiMiranda\dynamicbrands-backend\docs\ARCHITECTURE.md` |
| FRONTEND.md | `C:\Users\ManiMiranda\dynamicbrands-dashboard\docs\FRONTEND.md` |
| BACKEND.md | `C:\Users\ManiMiranda\dynamicbrands-backend\docs\BACKEND.md` |
| AMM.md | `C:\Users\ManiMiranda\dynamicbrands\docs\AMM.md` |
| CONSUMER_APP.md | `C:\Users\ManiMiranda\dynamicbrands-consumer\docs\CONSUMER_APP.md` |
| CONTRACTS.md | `C:\Users\ManiMiranda\dynamicbrands\docs\CONTRACTS.md` |
| BLOCKCHAIN.md | `C:\Users\ManiMiranda\dynamicbrands-backend\docs\BLOCKCHAIN.md` |
| DESIGN.md | `C:\Users\ManiMiranda\dynamicbrands-dashboard\docs\DESIGN.md` |
| ORACLE.md | `C:\Users\ManiMiranda\dynamicbrands-backend\docs\ORACLE.md` |
| BACKOFFICE.md | `C:\Users\ManiMiranda\dynamicbrands-backend\docs\BACKOFFICE.md` |
| ADMIN_DASHBOARD.md | `C:\Users\ManiMiranda\dynamicbrands-backend\docs\ADMIN_DASHBOARD.md` |
| BACKLOG.md | `C:\Users\ManiMiranda\dynamicbrands\docs\BACKLOG.md` |
| DEV_ONLY.md | `C:\Users\ManiMiranda\dynamicbrands-backend\docs\DEV_ONLY.md` |

Before editing any .md file, Claude Code must:
1. Confirm the file exists at the exact path shown above using the terminal
2. Edit the file at that path — never create a duplicate
3. If a file is NOT in this map, ask Kevin where it should live before creating it
4. After any session that adds a new .md file, add it to this map before closing the session

---

## Claude Session Rules (C-3PO Behavior Protocol)

### Rule 1 — Read Before Claiming
Before making any architectural claim about a specific component, Claude must
confirm it has read the corresponding reference document. If the relevant .md
file has not been uploaded to the current session, Claude must ask for it
before continuing. No reasoning from memory or assumptions about project
internals.

Reference map:
- Smart contract behavior → ask for dynamicbrands/docs/CONTRACTS.md (external repo)
- Blockchain/wagmi/viem patterns → ask for BLOCKCHAIN.md
- Backend/listener/API → ask for BACKEND.md
- Design system/UI → ask for DESIGN.md
- Consumer mobile app → ask for CONSUMER_APP.md (when created)

### Rule 2 — Uncertainty Signal
If Claude uses the words "likely", "probably", "I believe", or "I think"
about anything in the Dynamic Brands project, that is a signal Claude is
guessing. Kevin should immediately ask: "Which .md file do you need?"
and Claude must stop and request it before proceeding.

### Rule 3 — Session Start Checklist
At the start of every Dynamic Brands session, before writing any code:
1. Flag if docs/SYSTEM.md or docs/ARCHITECTURE.md is missing or incomplete
2. Ask Kevin which docs/*.md files are relevant to today's work
3. Request those files if not already uploaded
4. Verify the session has a clear data flow understanding before proceeding

### Rule 4 — Single R2D2 Punch Rule
Every Claude Code prompt must be one single self-contained message.
It must include both the file creation AND the execution command.
Never split a task into "create" and "run" as separate messages.
Claude Code alerts when tasks are split — this causes crashes and
wastes tokens.

### Rule 5 — Port 3002 Standard Startup
Always use this sequence to start the backend — never just `npm run dev`:
npm run kill
npm run dev
This prevents EADDRINUSE errors from orphaned Claude Code shell processes.

### Rule 6 — No Hardcoding
Never hardcode values that belong in configuration:
- Contract addresses → must come from a config file or .env
- brandId: 1 → must be dynamic from session/auth context
- Block numbers → must come from deployment records
- RPC URLs → must come from .env only
See docs/DEV_ONLY.md for the full list of dev-only exceptions.

### Rule 7 — Auto-Distribution Backlog
When implementing NFT configuration UI, include:
- autoDistribute boolean checkbox: "Execute weekly cashbacks automatically"
- Backend cron job (Friday) that calls executeDistribution for all brands
  where autoDistribute = true
- autoDistribute field in Supabase brands table
This is a confirmed product decision from the May 2026 session.

### Rule 8 — Documentation Map Enforcement
Before creating or editing any .md file, Claude Code must:
1. Check the Documentation File Map in this file for the exact path
2. Confirm the file exists at that path using the terminal before touching it
3. If the file is NOT in the map, ask Kevin where it should live before creating it
4. Never create a new .md file with the same name as an existing one regardless of directory
5. After any session that adds a new .md file, add it to this map before closing the session
