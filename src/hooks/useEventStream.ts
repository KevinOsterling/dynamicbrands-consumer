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
  // Holds the latest connect fn so onclose's setTimeout doesn't capture a stale reference
  const connectRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!wallet) {
      setConnectionState('offline')
      return
    }

    function addEvents(incoming: DynamicEvent[]) {
      const fresh = incoming.filter(e => !seenIds.current.has(e.id))
      if (!fresh.length) return
      fresh.forEach(e => seenIds.current.add(e.id))
      setEvents(prev => [...fresh, ...prev])
    }

    function stopPolling() {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }

    function startPolling() {
      if (pollRef.current) return
      async function poll() {
        try {
          const res = await fetch(`${BACKEND_URL}/consumers/${wallet}/events`)
          if (res.ok) addEvents(await res.json())
        } catch {}
      }
      poll()
      pollRef.current = setInterval(poll, PULL_INTERVAL_MS)
    }

    function connect() {
      wsRef.current?.close()
      setConnectionState('connecting')

      const ws = new WebSocket(`${WS_URL}/ws?wallet=${wallet}`)
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionState('live')
        stopPolling()
        if (reconnectRef.current) {
          clearTimeout(reconnectRef.current)
          reconnectRef.current = null
        }
      }

      ws.onmessage = ({ data }) => {
        try {
          const parsed = JSON.parse(data) as DynamicEvent | DynamicEvent[]
          addEvents(Array.isArray(parsed) ? parsed : [parsed])
        } catch {}
      }

      ws.onclose = () => {
        if (wsRef.current !== ws) return
        setConnectionState('polling')
        startPolling()
        reconnectRef.current = setTimeout(() => connectRef.current(), 5_000)
      }

      ws.onerror = () => ws.close()
    }

    connectRef.current = connect
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
  }, [wallet])

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
