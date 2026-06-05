'use client'
import { usePrivy } from '@privy-io/react-auth'
import { useEventStream } from '@/hooks/useEventStream'
import { useWalletContext } from '@/context/WalletContext'
import { EventCard } from './EventCard'
import { ConnectionBadge } from './ConnectionBadge'

export function EventFeed() {
  const { logout } = usePrivy()
  const { walletAddress } = useWalletContext()
  const { events, connectionState, markRead } = useEventStream(walletAddress)
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
          <div className="flex items-center gap-3">
            <ConnectionBadge state={connectionState} />
            <button
              onClick={() => logout()}
              title="Cerrar sesión"
              className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        {!walletAddress ? (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-500">
            <div className="w-8 h-8 rounded-full border-4 border-zinc-700 border-t-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-sm">Cargando billetera...</p>
          </div>
        ) : events.length === 0 ? (
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
