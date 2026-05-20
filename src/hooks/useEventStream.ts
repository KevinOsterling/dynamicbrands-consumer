'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { DynamicEvent } from '@/lib/types'
import { BACKEND_URL, WS_URL, PULL_INTERVAL_MS } from '@/lib/config'

export type ConnectionState = 'connecting' | 'live' | 'polling' | 'offline'

export function useEventStream(wallet: string | null) {
  const [events, setEvents] = useState<DynamicEvent[]>([])
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    wallet ? 'connecting' : 'offline'
  )

  const seenIds = useRef(new Set<string>())
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Always holds the latest connect fn — avoids stale closure in the reconnect timer
  const connectRef = useRef<() => void>(() => {})
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const addEvents = useCallback((incoming: DynamicEvent[]) => {
    const fresh = incoming.filter(e => !seenIds.current.has(e.id))
    if (!fresh.length) return
    fresh.forEach(e => seenIds.current.add(e.id))
    setEvents(prev => [...fresh, ...prev])
  }, [])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  // Fetches all events for the wallet — used on reconnect to catch up on the gap
  const fetchMissed = useCallback(async () => {
    if (!wallet) return
    try {
      const res = await fetch(`${BACKEND_URL}/consumers/${wallet}/events`)
      if (res.ok) {
        const data = await res.json()
        addEvents(Array.isArray(data) ? data : (data.events ?? []))
      }
    } catch {}
  }, [wallet, addEvents])

  const startPolling = useCallback(() => {
    if (pollRef.current || !wallet) return
    async function poll() {
      try {
        const res = await fetch(`${BACKEND_URL}/consumers/${wallet}/events`)
        if (res.ok) {
          const data = await res.json()
          addEvents(Array.isArray(data) ? data : (data.events ?? []))
        }
      } catch {}
    }
    poll()
    pollRef.current = setInterval(poll, PULL_INTERVAL_MS)
  }, [wallet, addEvents])

  const connect = useCallback(() => {
    if (!wallet || !mountedRef.current) return
    wsRef.current?.close()
    setConnectionState('connecting')

    const ws = new WebSocket(`${WS_URL}/ws?wallet=${wallet}`)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      setConnectionState('live')
      stopPolling()
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current)
        reconnectRef.current = null
      }
      // Catch up on any events that arrived while the socket was down
      fetchMissed()
    }

    ws.onmessage = ({ data }) => {
      if (!mountedRef.current) return
      try {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          addEvents(parsed)
        } else if (parsed?.events) {
          addEvents(parsed.events)
        } else if (parsed?.id) {
          addEvents([parsed])
        }
      } catch {}
    }

    ws.onclose = () => {
      if (wsRef.current !== ws || !mountedRef.current) return
      setConnectionState('polling')
      startPolling()
      reconnectRef.current = setTimeout(() => {
        if (mountedRef.current) connectRef.current()
      }, 5_000)
    }

    ws.onerror = () => ws.close()
  }, [wallet, addEvents, stopPolling, startPolling, fetchMissed])

  // Keep connectRef pointing at the latest connect so the reconnect timer never goes stale
  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  useEffect(() => {
    if (!wallet) {
      setConnectionState('offline')
      return
    }
    connect()
    return () => {
      wsRef.current?.close()
      wsRef.current = null
      stopPolling()
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current)
        reconnectRef.current = null
      }
    }
  }, [wallet, connect, stopPolling])

  const markRead = useCallback((id: string) => {
    setEvents(prev =>
      prev.map(e => e.id === id ? { ...e, readAt: new Date().toISOString() } : e)
    )
    if (!wallet) return
    fetch(`${BACKEND_URL}/consumers/${wallet}/events/${id}/read`, {
      method: 'PATCH',
    }).catch(() => {})
  }, [wallet])

  return { events, connectionState, markRead }
}
