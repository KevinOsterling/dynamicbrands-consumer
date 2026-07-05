'use client'
import { useCallback, useState } from 'react'
import { useSendTransaction } from '@privy-io/react-auth'
import { encodeFunctionData } from 'viem'
import { BRAND_NFT_ABI, BRAND_NFT_ADDRESS, CHAIN_ID } from '@/lib/brandNFT'
import { BACKEND_URL } from '@/lib/config'
import type { QRPayload } from '@/lib/qr'
import type { AssetItem } from '@/lib/types'

export type RedeemStatus = 'idle' | 'pending' | 'success' | 'error'

export interface RedeemResult {
  brandId?: number
  brandName?: string
}

const POLL_INTERVAL_MS = 3_000
const POLL_TIMEOUT_MS = 30_000

export function useRedeemQR(wallet: string | null) {
  const { sendTransaction } = useSendTransaction()
  const [status, setStatus] = useState<RedeemStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RedeemResult | null>(null)

  const redeem = useCallback(async (payload: QRPayload) => {
    if (!wallet) return
    setStatus('pending')
    setError(null)
    setResult(null)

    try {
      const data = encodeFunctionData({
        abi: BRAND_NFT_ABI,
        functionName: 'redeemQR',
        args: [payload.qrHash, BigInt(payload.expiry), payload.signature],
      })

      await sendTransaction({ to: BRAND_NFT_ADDRESS, data, chainId: CHAIN_ID })

      const baseline = await fetchBrandNftHoldings(wallet)
      const deadline = Date.now() + POLL_TIMEOUT_MS

      while (Date.now() < deadline) {
        await sleep(POLL_INTERVAL_MS)
        const current = await fetchBrandNftHoldings(wallet)
        const minted = current.find(asset => {
          const before = baseline.find(b => b.brandId === asset.brandId)
          return asset.balance > (before?.balance ?? 0)
        })
        if (minted) {
          setResult({ brandId: minted.brandId, brandName: minted.brandName })
          setStatus('success')
          return
        }
      }

      // Tx was accepted on-chain even if the backend listener hasn't caught up yet
      setStatus('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar el mint')
      setStatus('error')
    }
  }, [wallet, sendTransaction])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setResult(null)
  }, [])

  return { status, error, result, redeem, reset }
}

async function fetchBrandNftHoldings(wallet: string): Promise<AssetItem[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/consumers/${wallet}/assets`)
    if (!res.ok) return []
    const data = await res.json()
    const items: AssetItem[] = Array.isArray(data) ? data : (data.assets ?? [])
    return items.filter(a => a.type === 'brand_nft')
  } catch {
    return []
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
