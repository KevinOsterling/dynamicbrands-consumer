'use client'
import { useState, useEffect } from 'react'
import type { Proposal } from '@/lib/types'
import { BACKEND_URL } from '@/lib/config'

export type ProposalsStatus = 'loading' | 'success' | 'empty' | 'error'

// Phase 1: China Wok only. Made dynamic when consumer holds multiple brands.
const BRAND_ID = 1

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [status, setStatus] = useState<ProposalsStatus>('loading')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    fetch(`${BACKEND_URL}/brands/${BRAND_ID}/proposals`)
      .then(async res => {
        if (cancelled) return
        if (res.status === 404) {
          setProposals([])
          setStatus('empty')
          return
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (cancelled) return
        const items: Proposal[] = Array.isArray(data) ? data : (data.proposals ?? [])
        setProposals(items)
        setStatus(items.length === 0 ? 'empty' : 'success')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => { cancelled = true }
  }, [retryCount])

  return { proposals, status, retry: () => setRetryCount(c => c + 1) }
}
