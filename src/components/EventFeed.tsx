'use client'
import { useState } from 'react'
import type { DynamicEvent } from '@/lib/types'
import { EventCard } from './EventCard'
import { ConnectionBadge } from './ConnectionBadge'

function initEvents(): DynamicEvent[] {
  const now = Date.now()
  return [
    {
      id: '1',
      eventType: 'tamagotchi_requirement',
      title: '¡Acción requerida!',
      body: 'Tu Tamagotchi necesita atención antes de que expire el tiempo.',
      createdAt: new Date(now - 20 * 1000).toISOString(),
      expiresAt: new Date(now + 10 * 1000).toISOString(),
      senderName: 'Tamagotchi Engine',
    },
    {
      id: '2',
      eventType: 'campaign_award',
      title: 'Premio de campaña recibido',
      body: 'Completaste la campaña "Verano 2026" y ganaste 150 puntos.',
      createdAt: new Date(now - 5 * 60 * 1000).toISOString(),
      senderName: 'Nike Perú',
    },
    {
      id: '3',
      eventType: 'c2c_message',
      title: 'Nuevo mensaje',
      body: '¿Estás interesado en intercambiar tu NFT #1234 por el mío?',
      createdAt: new Date(now - 18 * 60 * 1000).toISOString(),
      senderName: '@crypto_fan',
    },
    {
      id: '4',
      eventType: 'cashback_friday',
      title: 'Cashback Friday activado',
      body: 'Tienes hasta las 23:59 para aprovechar tu cashback del 10%.',
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      eventType: 'dao_proposal',
      title: 'Nueva propuesta DAO',
      body: 'Votación abierta para la propuesta #42: cambio en estructura de fees.',
      createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      senderName: 'DAO Dynamic Brands',
    },
    {
      id: '6',
      eventType: 'nft_on_amm',
      title: 'NFT listado en mercado',
      body: 'Tu NFT #9901 fue listado exitosamente en el AMM.',
      createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
      senderName: 'Plataforma DB',
      readAt: new Date(now - 23 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

export function EventFeed() {
  const [events, setEvents] = useState<DynamicEvent[]>(initEvents)

  function handleRead(id: string) {
    setEvents(prev =>
      prev.map(e => e.id === id ? { ...e, readAt: new Date().toISOString() } : e)
    )
  }

  function handleTap(id: string) {
    setEvents(prev =>
      prev.map(e => e.id === id ? { ...e, readAt: new Date().toISOString() } : e)
    )
  }

  const unreadCount = events.filter(e => !e.readAt).length

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Notificaciones
          </h1>
          {unreadCount > 0 && (
            <span className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>
        <ConnectionBadge connected />
      </div>

      <div className="flex flex-col gap-3">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onRead={handleRead}
            onTap={handleTap}
          />
        ))}
      </div>
    </div>
  )
}
