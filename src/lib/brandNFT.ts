// Matches dynamicbrands-backend ACTIVE_BRAND_NFT (.env) and chain (Base Sepolia)
// V4 (brandMint redeploy, 2026-07-10) — dynamicbrands/deployments/v4-baseSepolia.json
export const BRAND_NFT_ADDRESS = '0x1de04c3b3ee03d3b17fc09f841679152175013e0' as const
export const CHAIN_ID = 84532

export const BRAND_NFT_ABI = [
  {
    type: 'function',
    name: 'redeemQR',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'qrHash', type: 'bytes32' },
      { name: 'expiry', type: 'uint256' },
      { name: 'oracleSignature', type: 'bytes' },
    ],
    outputs: [],
  },
] as const
