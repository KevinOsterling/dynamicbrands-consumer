'use client'
import { useState, useEffect } from 'react'
import type { DynamicEvent, EventType } from '@/lib/types'

const ICONS: Record<EventType, string> = {
  nft_minted: '🌱', cashback_friday: '💰', campaign_award: '🏆',
  dao_proposal: '🗳️', dao_update: '📋', new_brand_nft: '🎁',
  new_brand_campaign: '📣', brand_cashback: '💵', brand_decisions: '⚖️',
  brand_purchases: '🛍️', nft_proximity: '📍', oracle_event: '🔮',
  tamagotchi_requirement: '⏱️', consumer_achievement: '⭐',
  nft_on_amm: '📈', audit_requirement_consumer: '📋',
  platform_new_brand_nft: '🆕', vault_threshold: '⚠️',
  dbnft_distribution: '🪙', audit_requirement_brand: '📋',
  welcome: '🎉', c2c_message: '💬'
}

const BORDER: Record<EventType, string> = {
  nft_minted: 'border-emerald-400',
  cashback_friday: 'border-red-400',
  campaign_award: 'border-yellow-400',
  dao_proposal: 'border-blue-400',
  dao_update: 'border-blue-300',
  new_brand_nft: 'border-emerald-400',
  new_brand_campaign: 'border-purple-400',
  brand_cashback: 'border-red-400',
  brand_decisions: 'border-blue-400',
  brand_purchases: 'border-green-400',
  nft_proximity: 'border-orange-400',
  oracle_event: 'border-indigo-400',
  tamagotchi_requirement: 'border-orange-500',
  consumer_achievement: 'border-yellow-400',
  nft_on_amm: 'border-teal-400',
  audit_requirement_consumer: 'border-red-500',
  platform_new_brand_nft: 'border-emerald-400',
  vault_threshold: 'border-red-600',
  dbnft_distribution: 'border-teal-400',
  audit_requirement_brand: 'border-red-500',
  welcome: 'border-emerald-400',
  c2c_message: 'border-zinc-400'
}

interface Props {
  event: DynamicEvent
  onRead: (id: string) => void
  onTap?: (id: string) => void
}

export function EventCard({ event, onRead, onTap }: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [formattedDate, setFormattedDate] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const isTamagotchi = event.eventType === 'tamagotchi_requirement'
  const isRead = !!event.readAt

  const senderLabel = event.senderName ?? 'Dynamic Brands'

  useEffect(() => {
    setFormattedDate(new Date(event.createdAt).toLocaleString('es-PE', { hour12: true }))
  }, [event.createdAt])

  useEffect(() => {
    if (!isTamagotchi || !event.expiresAt) return
    const tick = () => {
      const remaining = Math.max(0, Math.floor(
        (new Date(event.expiresAt!).getTime() - Date.now()) / 1000
      ))
      setSecondsLeft(remaining)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isTamagotchi, event.expiresAt])

  function handleCardClick() {
    if (!isRead) onRead(event.id)
    setIsExpanded(v => !v)
  }

  return (
    <div
      className={`relative rounded-2xl bg-white dark:bg-zinc-900 border-l-4 ${BORDER[event.eventType]} shadow-sm transition-opacity ${isRead ? 'opacity-55' : 'opacity-100'}`}
    >
      {/* Collapsed header — always visible, tap to expand */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer select-none"
        onClick={handleCardClick}
      >
        <span className="text-2xl leading-none mt-0.5 shrink-0">{ICONS[event.eventType]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {event.title}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              {!isRead && <span className="w-2 h-2 rounded-full bg-blue-500" />}
              <svg
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">
            {senderLabel}
          </p>
          {!isExpanded && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
              {event.body}
            </p>
          )}
        </div>
      </div>

      {/* Expanded detail section */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="pt-3 pl-9">
            <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">
              {event.body}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">{formattedDate}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false) }}
              className="mt-3 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              Cerrar ↑
            </button>
          </div>
        </div>
      )}

      {/* Tamagotchi countdown — shown in both states */}
      {isTamagotchi && !isRead && secondsLeft !== null && (
        <div className="px-4 pb-4">
          {secondsLeft === 0 ? (
            <p className="text-xs text-red-500 font-medium">Tiempo expirado</p>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                <div
                  className="bg-orange-400 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${(secondsLeft / 10) * 100}%` }}
                />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onTap?.(event.id) }}
                className="px-4 py-1.5 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold rounded-full transition-colors"
              >
                TAP ({secondsLeft}s)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
