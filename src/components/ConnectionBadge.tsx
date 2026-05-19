interface Props {
  connected: boolean
}

export function ConnectionBadge({ connected }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        connected
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          connected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
        }`}
      />
      {connected ? 'En vivo' : 'Desconectado'}
    </span>
  )
}
