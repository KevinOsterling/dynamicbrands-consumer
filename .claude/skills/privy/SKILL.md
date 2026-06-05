---
name: Privy
description: Use when building authentication systems, creating embedded wallets, managing wallet controls and policies, sending transactions, or integrating wallet infrastructure into web, mobile, or backend applications. Agents should reach for this skill when implementing user onboarding, wallet creation, transaction signing, policy enforcement, or server-side wallet management.
metadata:
    mintlify-proj: privy
    version: "1.0"
---

# Privy Skill Reference

## Product summary

Privy is a wallet infrastructure and authentication platform that enables developers to embed wallets and user authentication directly into applications. It provides client-side SDKs (React, React Native, Swift, Android, Flutter, Unity) and server-side SDKs (Node.js, Java, Go, Rust, Ruby) to create embedded wallets, authenticate users via email/SMS/OAuth/wallet/passkey, and manage wallet controls with policies and authorization keys. The primary documentation is at https://docs.privy.io. Key files: `PrivyProvider` configuration in React apps, app ID and app secret from the Privy Dashboard, REST API endpoints at `https://api.privy.io/v1/`. Common CLI: SDKs are installed via npm/pip/go get/etc.

## When to use

Reach for this skill when:
- Building user authentication flows (email, SMS, OAuth, wallet, passkey, social login)
- Creating embedded wallets for users or applications
- Implementing wallet controls (owners, signers, policies, key quorums)
- Sending transactions or signing messages on EVM, Solana, or other chains
- Managing server-side wallet operations via backend SDKs
- Setting up webhooks for wallet events or transaction lifecycle
- Configuring policies to enforce transaction limits, recipient restrictions, or time-based rules
- Integrating external wallets (MetaMask, Phantom, etc.) alongside embedded wallets
- Migrating users from other authentication systems to Privy
- Building trading apps, treasury management, or agent wallets with strict controls

## Quick reference

### SDK Installation

| Platform | Command | Package |
|----------|---------|---------|
| React | `npm install @privy-io/react-auth` | @privy-io/react-auth |
| React Native | `npm install @privy-io/expo` | @privy-io/expo |
| Node.js | `npm install @privy-io/node` | @privy-io/node |
| Java | Maven/Gradle dependency | com.privy:privy-java |
| Go | `go get github.com/privy-io/go-sdk` | github.com/privy-io/go-sdk |
| Python | `pip install privy-client` | privy-client |
| REST API | Direct HTTP calls | N/A |

### PrivyProvider Configuration (React)

```tsx
<PrivyProvider
  appId="your-app-id"
  clientId="your-client-id"
  config={{
    embeddedWallets: {
      ethereum: { createOnLogin: 'users-without-wallets' },
      solana: { createOnLogin: 'users-without-wallets' }
    }
  }}
>
  {children}
</PrivyProvider>
```

### Core Concepts

| Concept | Purpose | Example |
|---------|---------|---------|
| **User** | Authenticated identity linked to accounts and wallets | Email, OAuth, wallet address |
| **Embedded wallet** | Privy-managed wallet secured by key splitting in TEEs | User's Ethereum or Solana wallet |
| **External wallet** | Third-party wallet (MetaMask, Phantom) linked to Privy account | User brings existing wallet |
| **Owner** | Entity with full control over wallet (user, auth key, or key quorum) | User ID or authorization key |
| **Signer** | Additional party with scoped permissions to sign transactions | Server automation, delegation |
| **Policy** | Rules constraining what actions are allowed (amounts, recipients, time) | Max transfer $1000/day |
| **Authorization key** | Cryptographic key for server-side wallet control | Backend signing endpoint |
| **Key quorum** | Multi-party approval requirement (users + keys) | 2-of-3 approval |

### Common API Endpoints

| Operation | Endpoint | Method |
|-----------|----------|--------|
| Create wallet | `POST /v1/wallets` | POST |
| Get wallet | `GET /v1/wallets/{id}` | GET |
| Send transaction | `POST /v1/wallets/{id}/ethereum/eth_sendTransaction` | POST |
| Create policy | `POST /v1/policies` | POST |
| Create user | `POST /v1/users` | POST |
| Get user | `GET /v1/users/{id}` | GET |
| Create key quorum | `POST /v1/key-quorums` | POST |

### Authentication Methods

| Method | Use case | Setup |
|--------|----------|-------|
| Email OTP | Passwordless, low friction | Enable in dashboard |
| SMS/WhatsApp | Phone-based verification | Configure provider |
| OAuth (Google, Apple, etc.) | Social login | Register OAuth app |
| Wallet (MetaMask, Phantom) | Crypto-native users | Configure chains |
| Passkey | Biometric/hardware security | Enable in dashboard |
| Farcaster | Farcaster mini-apps | Configure Farcaster app |
| Telegram | Telegram mini-apps | Configure Telegram bot |
| Custom OAuth | Your own provider | Configure JWKS endpoint |

## Decision guidance

### When to use embedded wallets vs external wallets

| Scenario | Embedded | External |
|----------|----------|----------|
| New users without wallets | ✓ | ✗ |
| Users with existing assets | ✗ | ✓ |
| Seamless UX priority | ✓ | ✗ |
| User controls keys directly | ✗ | ✓ |
| Cross-app compatibility | ✗ | ✓ |
| Onboarding friction acceptable | ✗ | ✓ |

### When to use Privy authentication vs JWT-based auth

| Scenario | Privy Auth | JWT-based |
|----------|-----------|-----------|
| No existing auth system | ✓ | ✗ |
| Multiple login methods needed | ✓ | ✗ |
| Existing auth provider (Auth0, Firebase) | ✗ | ✓ |
| Wallet-only authentication | ✓ | ✓ |
| MFA/passkey support needed | ✓ | ✗ |

### When to use client-side vs server-side wallet operations

| Operation | Client-side | Server-side |
|-----------|------------|------------|
| User signs transaction | ✓ | ✗ |
| Automated trading/rebalancing | ✗ | ✓ |
| Treasury management | ✗ | ✓ |
| User-initiated transfer | ✓ | ✗ |
| Batch wallet creation | ✗ | ✓ |
| Policy enforcement | ✓ | ✓ |

### When to use policies vs signers

| Scenario | Policies | Signers |
|----------|----------|---------|
| Enforce transaction limits | ✓ | ✗ |
| Restrict recipient addresses | ✓ | ✗ |
| Require multi-party approval | ✗ | ✓ |
| Time-based restrictions | ✓ | ✗ |
| Delegate scoped permissions | ✗ | ✓ |
| Prevent unintended actions | ✓ | ✗ |

## Workflow

### 1. Set up a Privy app

1. Log in to [Privy Dashboard](https://dashboard.privy.io)
2. Create a new app (separate apps for dev/staging/production)
3. Copy your **App ID** (public) and **App Secret** (keep secret)
4. Configure allowed origins in **Settings > Domains**
5. Enable login methods in **Settings > Login Methods**
6. Create app clients if using multiple environments

### 2. Integrate authentication (React example)

1. Install SDK: `npm install @privy-io/react-auth`
2. Wrap app with `PrivyProvider` at root level
3. Use `usePrivy()` hook to access `user`, `login`, `logout`
4. Use `useLoginWithEmail()` or other login hooks for specific methods
5. Wait for `ready` state before consuming Privy state
6. Handle authentication state in your components

### 3. Create embedded wallets

1. Configure `embeddedWallets` in `PrivyProvider` config with `createOnLogin` option
2. Or manually call `createWallet()` from `useCreateWallet()` hook
3. Access wallet via `useWallets()` hook
4. Specify chain type (ethereum, solana, etc.)
5. Optionally add signers or policies at creation time

### 4. Send transactions

1. Get wallet from `useWallets()` hook
2. For EVM: use `useSendTransaction()` or `useSignTransaction()`
3. For Solana: use `useSendTransaction()` from `@privy-io/react-auth/solana`
4. Pass transaction object with `to`, `value`, `data`, etc.
5. Handle success/error callbacks
6. Monitor transaction status via webhooks or polling

### 5. Implement wallet controls

1. Create authorization key for server-side control (via API)
2. Create policy with rules (amounts, recipients, time windows)
3. Create key quorum for multi-party approval if needed
4. Assign owners and signers to wallet at creation
5. Update policies via intent system for governance
6. Verify policies are enforced in secure enclave

### 6. Set up webhooks

1. Navigate to **Settings > Webhooks** in dashboard
2. Register webhook endpoint URL
3. Select events to subscribe to (user.created, transaction.confirmed, etc.)
4. Verify webhook signature using `privy-signature` header
5. Implement idempotent handlers (use idempotency keys)
6. Test webhooks in development (free), enable in production (Enterprise plan)

### 7. Server-side wallet management (Node.js example)

1. Install SDK: `npm install @privy-io/node`
2. Initialize client: `new PrivyClient({appId, appSecret})`
3. Create user: `client.users.create({...})`
4. Create wallet: `client.wallets.create({chainType, owner})`
5. Send transaction: `client.wallets.ethereum.sendTransaction({...})`
6. Manage policies: `client.policies.create({...})`

## Common gotchas

- **Missing `ready` state check**: Always wait for `usePrivy().ready` before accessing user or wallet state. Accessing stale state causes undefined behavior.
- **App ID vs App Secret**: App ID is public; App Secret must never be exposed in frontend code. Use only in backend.
- **Origin not allowlisted**: Add all parent origins (including localhost for dev) to **Settings > Domains** in dashboard. iFrame parents must also be allowlisted.
- **Wallet not initialized**: Wait for `useWallets().ready` before accessing wallets. Wallets load asynchronously.
- **Policy not enforced**: Policies are evaluated in the secure enclave at request time. Verify policy syntax and that wallet is linked to policy ID.
- **Webhook signature verification**: Always verify the `privy-signature` header using the app secret. Unverified webhooks are a security risk.
- **Rate limits on wallet creation**: Batch wallet creation is rate-limited. Use exponential backoff and idempotency keys to handle 429 responses.
- **Key export requires user approval**: Users must explicitly approve key export. Server-side wallets cannot export keys.
- **Solana wallet creation**: Requires explicit import of `useCreateWallet` from `@privy-io/react-auth/solana`, not the main package.
- **External wallet chain configuration**: External wallets require explicit chain configuration in dashboard. Not all wallets support all chains.
- **Policy updates via intents**: Changing policies requires creating an intent and having the owner authorize it. Direct updates are not allowed.
- **Idempotency keys**: Use idempotency keys for wallet creation and other mutations to prevent duplicate operations on retries.
- **JWT-based auth JWKS endpoint**: JWKS endpoint must be publicly accessible. Cloudflare or firewall rules may block Privy from fetching it.

## Verification checklist

Before submitting work with Privy:

- [ ] App ID and App Secret are correctly configured (ID in frontend, Secret in backend only)
- [ ] All required origins are allowlisted in **Settings > Domains**
- [ ] Login methods are enabled in dashboard for the methods you're using
- [ ] `PrivyProvider` wraps the entire app and `ready` state is checked before use
- [ ] Wallets are created with correct chain type (ethereum, solana, etc.)
- [ ] Policies are attached to wallets if access control is required
- [ ] Webhook endpoints are registered and signatures are verified
- [ ] Idempotency keys are used for wallet creation and mutations
- [ ] Error handling covers common errors: `invalid_origin`, `linked_to_another_user`, `Wallet proxy not initialized`
- [ ] Rate limiting is handled with exponential backoff (HTTP 429)
- [ ] User state is not accessed before `ready` is true
- [ ] Wallet state is not accessed before `useWallets().ready` is true
- [ ] External wallets have required chains configured in dashboard
- [ ] Sensitive operations (key export, policy updates) require user/owner approval
- [ ] Webhooks are tested in development before production deployment

## Resources

Comprehensive page-by-page navigation: https://docs.privy.io/llms.txt

Critical documentation pages:
- [Key Concepts](https://docs.privy.io/basics/key-concepts) — Understand authentication, wallets, and controls
- [React Quickstart](https://docs.privy.io/basics/react/quickstart) — Get started with embedded wallets and authentication
- [API Reference](https://docs.privy.io/api-reference/introduction) — Complete REST API documentation with all endpoints

---

> For additional documentation and navigation, see: https://docs.privy.io/llms.txt