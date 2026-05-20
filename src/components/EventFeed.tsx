'use client'
import { useEventStream } from '@/hooks/useEventStream'
import { EventCard } from './EventCard'
import { ConnectionBadge } from './ConnectionBadge'

// DEV: hardcoded wallet — replace with Privy wallet address when integrated
const DEV_WALLET = '0xa765a9D996636F608932b29a2889329fC30C3e1a'

export function EventFeed() {
  const { events, connectionState, markRead } = useEventStream(DEV_WALLET)
  const unread = events.filter(e => !e.readAt).length

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Notificaciones
              {unread > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold">
                  {unread}
                </span>
              )}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Tu inbox de marca
            </p>
          </div>
          <ConnectionBadge state={connectionState} />
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-500">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">No hay eventos aún</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onRead={markRead}
                onTap={(id) => markRead(id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
