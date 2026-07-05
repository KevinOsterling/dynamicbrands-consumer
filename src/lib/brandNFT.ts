// Matches dynamicbrands-backend/src/listener.ts BRAND_NFT_ADDRESS and chain (Base Sepolia)
export const BRAND_NFT_ADDRESS = '0x02a85d38d679e956a7640445a88dae0135a0002c' as const
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
