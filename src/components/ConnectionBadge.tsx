'use client'

type State = 'connecting' | 'live' | 'polling' | 'offline'

const LABELS: Record<State, string> = {
  connecting: 'Conectando...',
  live: 'En vivo',
  polling: 'Modo polling',
  offline: 'Sin conexión'
}

const DOTS: Record<State, string> = {
  connecting: 'bg-yellow-400 animate-pulse',
  live: 'bg-green-400',
  polling: 'bg-yellow-400',
  offline: 'bg-zinc-400'
}

export function ConnectionBadge({ state }: { state: State }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
      <span className={`w-1.5 h-1.5 rounded-full ${DOTS[state]}`} />
      {LABELS[state]}
    </div>
  )
}
