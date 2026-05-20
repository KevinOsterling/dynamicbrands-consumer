<!-- Mirror of: dynamicbrands-backend/docs/ARCHITECTURE.md — do not edit here -->
# ARCHITECTURE.md — Dynamic Brands System Blueprint
*The soul of the system. Read this before touching any code.*
*Last updated: May 19, 2026*

---

## The One Sentence That Explains Everything

A consumer scans a QR code on a Chinese food container → a Living NFT is minted on Base blockchain → the backend detects it → stores it in Supabase → the brand manager sees it on the dashboard → every Friday the consumer receives USDC cashback automatically.

---

## System Components Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BASE SEPOLIA BLOCKCHAIN                       │
│                                                                     │
│  DynamicBrandsRegistry   CampaignEngine   BrandDAO                  │
│  BrandNFT                DistributionVaultV2  MockUSDC              │
│                                                                     │
│  ← EVENTS FLOW OUT →                                                │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ viem getLogs every 12 seconds
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICE (port 3002)                       │
│                    dynamicbrands-backend                            │
│                                                                     │
│  listener.ts              ← catches blockchain events               │
│  api/routes.ts            ← original REST endpoints                 │
│  api/notification-routes.ts ← messaging layer endpoints             │
│  notifications/router.ts  ← persist → WS → FCM routing             │
│  notifications/types.ts   ← EventType, Channel, EVENT_CHANNEL_MAP  │
│  db/client.ts             ← Prisma singleton                        │
│                                                                     │
│  ← WRITES TO DB →         ← READS FROM DB →  ← PUSHES TO APP →    │
└──────────┬────────────────────────────┬───────────────┬────────────┘
           │                            │               │
           ▼                            ▼               ▼
┌──────────────────────┐   ┌──────────────────┐  ┌─────────────────────────────────────┐
│  SUPABASE POSTGRESQL │   │ DASHBOARD (3000) │  │  CONSUMER APP (mobile/web)          │
│                      │   │                  │  │                                     │
│  holders             │   │  Purchases page  │  │  Real-time feed ← WebSocket         │
│  distributions       │   │  Cashbacks page  │  │                   /ws?wallet=       │
│  dao_proposals       │   │  Decisions page  │  │  Lock screen    ← FCM push          │
│  campaign_claims     │   │  Dashboard home  │  │  Pull fallback  ← GET               │
│  tamagotchi_events   │   │                  │  │    /consumers/:wallet/events        │
│  dynamic_events      │   └──────────────────┘  └─────────────────────────────────────┘
│  consumer_devices    │
│  brand_message_settings│
│  system_params       │
│  brand_audits        │
│  brands              │
│  db_nft_mints        │
│  platform_fees       │
│  sync_cursor         │
└──────────────────────┘
```

---

## The 9 Blockchain Events — Complete Map

| Event | Contract | Trigger | DB Table | DB Action | Notification |
|-------|----------|---------|----------|-----------|--------------|
| `NFTMinted` | BrandNFT | Consumer scans QR code | `holders` | UPSERT holder row | `nft_minted` → `ws+fcm` |
| `TransferSingle` | BrandNFT | Any NFT transfer (mint, send, burn) | `holders` | UPSERT sender & receiver balances | — |
| `DistributionExecuted` | DistributionVaultV2 | Friday USDC distribution runs | `distributions` | INSERT new distribution row | `brand_cashback` fan-out → `ws+fcm` |
| `ProposalSubmitted` | BrandDAO | Consumer submits DAO proposal | `dao_proposals` | INSERT new proposal row | — |
| `ProposalStatusChanged` | BrandDAO | Brand manager changes proposal status | `dao_proposals` | UPDATE status field | — |
| `AwardClaimed` | CampaignEngine | Consumer claims campaign award | `campaign_claims` | INSERT new claim row | `campaign_award` → `ws+fcm` |
| `DBNFTMinted` | DistributionVaultV2 | DB-NFT minted to brand after distribution | `db_nft_mints` | UPSERT by txHash | — |
| `PlatformFeeDistributed` | DistributionVaultV2 | Platform fee routed after distribution | `platform_fees` | UPSERT by txHash | — |
| *(Tamagotchi — Phase 2)* | BrandNFT | Consumer taps Tamagotchi notification | `tamagotchi_events` | INSERT event row | `tamagotchi_requirement` → `fcm` |

---

## Data Flow — Consumer QR Scan (The Core Loop)

```
REAL WORLD          BLOCKCHAIN              BACKEND                 DASHBOARD
─────────────────────────────────────────────────────────────────────────────

Consumer scans
QR code on
China Wok box
      │
      ▼
Privy wallet
signs tx
      │
      ▼
BrandNFT
.redeemQR()
      │
      ├─→ NFTMinted event ──────→ listener.ts ──────→ holders table
      │     args:                  handleNFTMinted()    UPSERT row:
      │     - consumer wallet                           - walletAddress
      │     - brandId: 1                                - brandId: 1
      │     - timestamp                                 - mintedAt
      │                                                 - currentTier: 1
      │                                                 - tokenBalance: 1
      │                                                 - isActive: true
      │                                                       │
      │                                                       ▼
      │                                            routeNotification()
      │                                            eventType: nft_minted
      │                                            channel: ws+fcm
      │                                            → dynamic_events (persist)
      │                                            → WebSocket (if open)
      │                                            → FCM push (if closed)
      │
      └─→ TransferSingle event ─→ listener.ts ──────→ holders table
            args:                  handleNFTTransfer()  UPSERT:
            - from: 0x000          (mint case,          - tokenBalance++
            - to: consumer         from=zero address)
            - id: 1
            - value: 1
                                                              │
                                                              ▼
                                                   GET /brands/1/holders
                                                              │
                                                              ▼
                                                   Purchases page shows
                                                   new Titulares Únicos
                                                   count
```

---

## Data Flow — Friday USDC Distribution

```
SCHEDULER           BLOCKCHAIN              BACKEND                 DASHBOARD
─────────────────────────────────────────────────────────────────────────────

Every Friday
Oracle wallet
calls
DistributionVault
.executeDistribution()
      │
      ▼
DistributionExecuted
event fires
      │
      args:
      - distributionId
      - totalAmount: 50 USDC
      - perNFTAmount
      - recipientCount
      - timestamp
      │
      └──────────────────→ listener.ts ──────→ distributions table
                            handleDistribution()  INSERT row:
                                                  - distributionId
                                                  - totalAmount
                                                  - perNftAmount
                                                  - recipientCount
                                                  - executedAt
                                                  - blockNumber
                                                        │
                                          ┌─────────────┴──────────────────┐
                                          ▼                                 ▼
                               GET /brands/1/distributions    triggerBrandAutoMessage()
                                          │                   eventType: brand_cashback
                                          ▼                   → routeToAllHolders()
                               Cashbacks page shows           → dynamic_events (persist)
                               history + vault balance        → WS / FCM per holder
```

---

## Data Flow — DAO Proposal

```
CONSUMER            BLOCKCHAIN              BACKEND                 DASHBOARD
─────────────────────────────────────────────────────────────────────────────

Consumer submits
proposal via
dashboard
      │
      ▼
BrandDAO
.submitProposal()
      │
      ▼
ProposalSubmitted ────────────────────────→ dao_proposals table
event                                        INSERT:
      │                                      - proposalId
      │                                      - proposer wallet
      │                                      - description
      │                                      - status: 0 (pending)
      │                                      - submittedAt
      │
Brand manager
marks implemented
      │
      ▼
ProposalStatusChanged ────────────────────→ dao_proposals table
event                                        UPDATE:
                                             - status: new value
                                                    │
                                                    ▼
                                         GET /brands/1/proposals
                                                    │
                                                    ▼
                                         Decisions page shows
                                         proposal list + status
```

---

## Data Flow — Messaging Layer (Notification Routing)

```
EVENT SOURCE        ROUTER                  DELIVERY
──────────────────────────────────────────────────────────────────────

Any event
(blockchain / brand
 dashboard / admin)
      │
      ▼
routeNotification(NotificationEvent)
      │
      ├─→ applyAgentPersonalization()   ← AI slot (Phase 1: passthrough)
      │
      ├─→ prisma.dynamicEvent.create()  ← ALWAYS persisted (Pull fallback reads here)
      │
      ├─→ channel = EVENT_CHANNEL_MAP[eventType]
      │
      ├── channel: 'internal' ─────────→ log only, no delivery
      │
      ├── channel: 'ws' ──────────────→ pushToWallet() if connected
      │                                  else: drop (ws-only, no FCM fallback)
      │
      ├── channel: 'fcm' ─────────────→ sendPushNotification() always
      │
      └── channel: 'ws+fcm' ──────────→ pushToWallet() if connected → return
                                         sendPushNotification() if not connected

Fan-out path (DistributionExecuted, brand broadcasts):
      routeToAllHolders(brandId, event)
        └─→ SELECT active holders WHERE brandId
        └─→ Promise.allSettled → routeNotification() per holder
```

### Event Type → Channel Reference

| EventType | Channel | Trigger |
|-----------|---------|---------|
| `nft_minted` | `ws+fcm` | BrandNFT NFTMinted |
| `brand_cashback` | `ws+fcm` | DistributionExecuted fan-out |
| `campaign_award` | `ws+fcm` | CampaignEngine AwardClaimed |
| `consumer_achievement` | `ws+fcm` | Brand marks achievement manually |
| `nft_proximity` | `fcm` | Location trigger (future) |
| `tamagotchi_requirement` | `fcm` | Phase 2 liveness check |
| `audit_requirement_consumer` | `fcm` | Admin audit flow |
| `dao_proposal` | `ws` | DAO event |
| `dao_update` | `ws` | Proposal status change |
| `brand_decisions` | `ws` | Brand DAO update |
| `cashback_friday` | `ws+fcm` | Direct consumer cashback event (blockchain) |
| `new_brand_nft` | `ws+fcm` | Brand auto-message: new NFT available |
| `platform_new_brand_nft` | `ws+fcm` | Platform admin: new brand NFT notification |
| `oracle_event` | `ws+fcm` | Oracle / third-party event (future) |
| `new_brand_campaign` | `ws` | Brand auto-message: new campaign live |
| `brand_purchases` | `ws` | Brand purchases activity update |
| `nft_on_amm` | `ws` | NFT listed on AMM (future) |
| `vault_threshold` | `ws+fcm` | Admin trip wire |
| `dbnft_distribution` | `ws` | Admin DB-NFT event |
| `audit_requirement_brand` | `fcm` | Admin audit notification (brand-facing) |
| `c2c_message` | `ws+fcm` | Reserved — C2C not yet implemented |

---

## Database Tables — Purpose & Status

### `holders` — WHO owns China Wok NFTs
- **Populated by:** `NFTMinted` + `TransferSingle` events
- **Current rows:** 22 (all testnet wallets)
- **Key fields:** `walletAddress`, `brandId`, `tokenBalance`, `isActive`, `currentTier`
- **Dashboard consumer:** Purchases page → Titulares Únicos card ✅ CONNECTED

### `distributions` — WHEN and HOW MUCH USDC was paid out
- **Populated by:** `DistributionExecuted` event
- **Current rows:** 0 (no distributions run since backend went live)
- **Key fields:** `distributionId`, `totalAmount`, `perNftAmount`, `recipientCount`, `executedAt`
- **Dashboard consumer:** Cashbacks page ← NOT YET CONNECTED

### `dao_proposals` — WHAT consumers are voting on
- **Populated by:** `ProposalSubmitted` + `ProposalStatusChanged` events
- **Current rows:** 0 (no proposals submitted since backend went live)
- **Key fields:** `proposalId`, `proposer`, `description`, `status`, `votesFor`, `votesAgainst`
- **Dashboard consumer:** Decisions page ← NOT YET CONNECTED

### `campaign_claims` — WHO claimed WHAT campaign award
- **Populated by:** `AwardClaimed` event
- **Current rows:** 0 (no campaigns with awards claimed yet)
- **Key fields:** `campaignId`, `walletAddress`, `brandId`, `claimedAt`, `awardType`
- **Dashboard consumer:** Campaigns page ← NOT YET CONNECTED

### `tamagotchi_events` — Consumer liveness check history
- **Populated by:** Tamagotchi tap events (Phase 2)
- **Current rows:** 0
- **Dashboard consumer:** Future consumer app

### `db_nft_mints` — DB-NFT mint events from DistributionVaultV2
- **Populated by:** `DBNFTMinted` event (DistributionVaultV2)
- **Current rows:** 0 (DistributionVaultV2 newly deployed)
- **Key fields:** `brandId`, `toAddress`, `amount`, `newTotalMinted`, `txHash`, `blockNumber`, `timestamp`
- **Dashboard consumer:** Future cashbacks page enhancement

### `platform_fees` — Platform fee distribution events from DistributionVaultV2
- **Populated by:** `PlatformFeeDistributed` event (DistributionVaultV2)
- **Current rows:** 0 (DistributionVaultV2 newly deployed)
- **Key fields:** `brandId`, `feeAmountUsdc`, `distributionId`, `txHash`, `blockNumber`, `timestamp`
- **Dashboard consumer:** Future finance/analytics page

### `dynamic_events` — All notifications delivered to consumers
- **Populated by:** `routeNotification()` on every routed event (always, regardless of channel)
- **Key fields:** `consumerWallet`, `senderType`, `senderName`, `brandId`, `eventType`, `title`, `body`, `channel`, `readAt`, `expiresAt`
- **Purpose:** Pull fallback source of truth — Consumer App polls `GET /consumers/:wallet/events?since=` every 30s
- **Indexed on:** `(consumerWallet, createdAt)`
- **Consumer:** Consumer App feed + unread badge count

### `consumer_devices` — FCM token registry
- **Populated by:** `POST /consumers/:wallet/device-token`
- **Key fields:** `consumerWallet`, `fcmToken`, `platform` (ios/android/web), `lastSeenAt`
- **Purpose:** Maps wallet → FCM token for push delivery; stale tokens cleaned up after FCM 404
- **Unique on:** `fcmToken`

### `brand_message_settings` — Per-brand auto-message configuration
- **Populated by:** `PUT /brands/:brandId/message-settings` (Brand Dashboard)
- **Key fields:** `brandId`, `eventType`, `enabled`, `template`
- **Purpose:** Brand Dashboard can toggle auto-messages per event type and set custom `{{variable}}` templates
- **Unique on:** `(brandId, eventType)` — one row per brand per event type
- **Default behavior:** If no row exists for a brand+eventType, treated as enabled with default template

### `system_params` — Admin-configurable platform parameters
- **Populated by:** Admin panel
- **Key fields:** `key` (PK), `value`, `unit`, `description`, `lastChangedAt`, `lastChangedBy`
- **Purpose:** Trip wire thresholds and platform-wide settings (e.g. max weekly QR scans, max distribution amount)

### `brand_audits` — Audit records triggered by trip wires
- **Populated by:** Admin backend when a trip wire fires
- **Key fields:** `brandId`, `triggeredAt`, `triggerReason`, `status` (pending/approved/rejected), `evidenceQrConfirmed`, `evidenceGeoConfirmed`, `evidenceEngagementConfirmed`
- **Purpose:** Brands flagged by admin trip wires must be reviewed before distributions resume

### `brands` — Brand registry
- **Populated by:** Admin panel
- **Key fields:** `brandId` (PK), `name`, `distributionBlocked`, `active`
- **Purpose:** Controls whether a brand's distributions are blocked (set true during active audit)

### `sync_cursor` — Backend restart recovery
- **Populated by:** listener.ts after every successful 12s poll cycle
- **Current rows:** 1 (lastProcessedBlock updates every 12s)
- **Purpose:** On restart, sync from lastProcessedBlock+1 to catch missed events
- **Dashboard consumer:** None — internal use only

---

## API Endpoints — Complete List

### Original
| Method | Route | DB Query | Dashboard Page | Status |
|--------|-------|----------|----------------|--------|
| GET | `/health` | none | none | ✅ Live |
| GET | `/brands/:id/holders/count` | COUNT holders WHERE brandId | Purchases page | ✅ Live |
| GET | `/brands/:id/holders` | SELECT holders WHERE brandId | Purchases page | ✅ Live |
| GET | `/brands/:id/distributions` | SELECT distributions WHERE brandId | Cashbacks page | ✅ Live |
| GET | `/brands/:id/proposals` | SELECT dao_proposals WHERE brandId | Decisions page | ✅ Live |
| GET | `/brands/:id/claims` | SELECT campaign_claims WHERE brandId | Campaigns page | ⬜ Not wired |
| GET | `/brands/:id/summary` | Aggregates across tables | Dashboard home | ✅ Live |

### Messaging Layer
| Method | Route | Description | Status |
|--------|-------|-------------|--------|
| POST | `/consumers/:wallet/device-token` | Register FCM token → `consumer_devices` | ✅ Live |
| GET | `/consumers/:wallet/events` | Pull fallback — events since timestamp | ✅ Live |
| PATCH | `/consumers/:wallet/events/:eventId/read` | Mark single event read | ✅ Live |
| PATCH | `/consumers/:wallet/events/read-all` | Mark all events read | ✅ Live |
| WS | `/ws?wallet=` | WebSocket connection for real-time events | ✅ Live |
| POST | `/brands/:brandId/messages` | Brand Dashboard manual broadcast to all holders | ✅ Live |
| GET | `/brands/:brandId/message-settings` | Fetch brand auto-message settings | ✅ Live |
| PUT | `/brands/:brandId/message-settings` | Update brand auto-message settings | ✅ Live |
| POST | `/admin/messages` | Admin sends event to one wallet | ✅ Live |
| POST | `/admin/brands/:brandId/broadcast` | Admin broadcasts to all brand holders | ✅ Live |
| POST | `/brands/:brandId/consumers/:wallet/achievement` | Mark consumer achievement, fires notification | ✅ Live |

### Admin Routes (require `x-admin-key` header)
| Method | Route | Description | Status |
|--------|-------|-------------|--------|
| GET | `/admin/params` | List all system params | ✅ Live |
| PATCH | `/admin/params/:key` | Update a system param value | ✅ Live |
| GET | `/admin/audits` | All audit records, ordered by triggered_at desc | ✅ Live |
| GET | `/admin/audits/pending` | Pending audits only | ✅ Live |
| GET | `/admin/audits/:brandId` | Full audit history for one brand | ✅ Live |
| POST | `/admin/audits/:brandId/approve` | Approve pending audit, unblocks brand distribution | ✅ Live |
| POST | `/admin/audits/:brandId/reject` | Reject pending audit, deactivates brand | ✅ Live |
| GET | `/admin/platform/totals` | Aggregate metrics across all brands | ✅ Live |
| GET | `/admin/platform/brands` | All brands with health status | ✅ Live |

---

## Listener Timing & Volumes

```
Every 12 seconds:
  └─→ Poll 5 blocks (Base Sepolia ~2s block time)
  └─→ Check 9 event types across 4 contracts (BrandNFT, DistributionVaultV2, BrandDAO, CampaignEngine)
  └─→ Write any new events to Supabase
  └─→ Update sync_cursor.lastProcessedBlock

On backend restart:
  └─→ Read sync_cursor.lastProcessedBlock
  └─→ If cursor exists: sync from cursor+1 to current block
  └─→ If no cursor: full sync from block 38799821
  └─→ Start 12s polling loop
```

---

## Contract Addresses — Base Sepolia

```
Registry:          0xb0D62f9a32335826Bc111a1722DEBc2d3c53e80f
BrandNFT:          0xc06eB97a6D47eB4bE29448a126096B8dF7858e74
CampaignEngine:    0x1F98680ca5Ff660413709AB67c6fAb05acf697d7
BrandDAO:          0xcd31F908c7c6addF40f0f75E5AcC50B1568aF985
DistributionVaultV2: 0xedfb20429db228ceeaa573ab5560ec346cb02a2a
MockUSDC:          0xf835022e1eFa91B4148890676950F7b0dc0c65B9
Oracle/Scheduler:  0xa765a9D996636F608932b29a2889329fC30C3e1a
Deployment block:  38799821
Chain ID:          84532 (Base Sepolia)
RPC:               https://base-sepolia.gateway.tenderly.co
```

---

## What Is Proven End-to-End on Testnet

```
✅ QR scan → NFT minted (simulateQR.ts confirmed)
✅ NFT mint → backend listener detects it
✅ Backend → writes to Supabase holders table
✅ Supabase → API endpoint serves holder count
✅ API → Purchases page displays Titulares Únicos
✅ Vault funded → distribution executed → consumer received 50 USDC
✅ DAO proposal submitted → voted → marked implemented → proposer got bonus NFT
✅ sync_cursor → crash recovery on backend restart
✅ Messaging layer: WebSocket, FCM, Pull API, router, fan-out — smoke tests passed
✅ dynamic_events, consumer_devices, brand_message_settings tables live in Supabase
✅ brand_cashback auto-message fires on every DistributionExecuted
✅ Cashbacks page wired to /brands/1/distributions
✅ Decisions page wired to /brands/1/proposals
✅ Dashboard home wired to /brands/1/summary (single aggregated endpoint)

⬜ Live mint → backend catches it in real time (missed due to backend downtime)
⬜ Consumer App connected to WebSocket / Pull endpoints
```

---

## What Needs to Happen for China Wok Mainnet Launch

1. All dashboard pages wired to backend API (no more wagmi direct reads, no localStorage)
2. Upgradeable proxy pattern on all 5 contracts
3. Real USDC (not MockUSDC) in DistributionVault
4. Privy paymaster for consumer gas sponsorship
5. Real QR codes on real China Wok packaging
6. Consumer app (separate mobile-first project)

---

## The Three Circles = The Data Model

```
🔵 BLUE  = Decisions  = dao_proposals table     = BrandDAO contract
🔴 RED   = Cashbacks  = distributions table     = DistributionVault contract
🟢 GREEN = Purchases  = holders table           = BrandNFT contract
⚪ CENTER = Campaigns  = campaign_claims table   = CampaignEngine contract
```

Every page in the dashboard maps to one circle.
Every circle maps to one contract.
Every contract maps to one DB table.
Every DB table maps to one API endpoint.
This is the system.
