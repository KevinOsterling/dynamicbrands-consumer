'use client'
import { useState, useEffect } from 'react'
import type { AssetItem } from '@/lib/types'
import { BACKEND_URL } from '@/lib/config'

export type AssetsStatus = 'loading' | 'success' | 'empty' | 'error'

export function useAssets(wallet: string | null) {
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [status, setStatus] = useState<AssetsStatus>('loading')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!wallet) return
    let cancelled = false
    setStatus('loading')

    fetch(`${BACKEND_URL}/consumers/${wallet}/assets`)
      .then(async res => {
        if (cancelled) return
        if (res.status === 404) {
          setAssets([])
          setStatus('empty')
          return
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (cancelled) return
        const items: AssetItem[] = Array.isArray(data) ? data : (data.assets ?? [])
        setAssets(items)
        setStatus(items.length === 0 ? 'empty' : 'success')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => { cancelled = true }
  }, [wallet, retryCount])

  return { assets, status, retry: () => setRetryCount(c => c + 1) }
}
