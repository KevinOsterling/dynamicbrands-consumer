'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Events', icon: '📬', href: '/' },
  { label: 'Wallet', icon: '💳', href: '/wallet' },
  { label: 'DAO', icon: '🗳️', href: '/dao' },
  { label: 'AMM', icon: '📈', href: '/amm' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center">
      {TABS.map(tab => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-xs font-medium transition-colors ${
              active
                ? 'text-blue-500'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
