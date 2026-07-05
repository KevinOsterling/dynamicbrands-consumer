'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { usePrivy, useWallets, useCreateWallet } from '@privy-io/react-auth'
import { LoginScreen } from './LoginScreen'
import { WalletContext } from '@/context/WalletContext'

function Spinner() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-zinc-700 border-t-blue-500 animate-spin" />
    </div>
  )
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { ready, authenticated } = usePrivy()
  const { wallets, ready: walletsReady } = useWallets()
  const { createWallet } = useCreateWallet()
  const [creating, setCreating] = useState(false)
  // Prevent double-invocation if wallets array reference changes mid-flight
  const creatingRef = useRef(false)

  const embeddedWallet = walletsReady
    ? wallets.find(w => w.walletClientType === 'privy' || w.walletClientType === 'privy-v2')
    : undefined

  useEffect(() => {
    if (!authenticated || !walletsReady || embeddedWallet || creatingRef.current) return
    creatingRef.current = true
    setCreating(true)
    createWallet()
      .catch(() => {
        // wallet may already exist on the account; useWallets() will reflect it
      })
      .finally(() => setCreating(false))
  }, [authenticated, walletsReady, embeddedWallet, createWallet])

  if (!ready) return <Spinner />
  if (!authenticated) {
    // /redeem renders its own branded claim landing page + login prompt, not the generic screen
    if (pathname === '/redeem') return <>{children}</>
    return <LoginScreen />
  }
  if (!walletsReady || creating || !embeddedWallet) return <Spinner />

  return (
    <WalletContext.Provider value={{ walletAddress: embeddedWallet.address }}>
      {children}
    </WalletContext.Provider>
  )
}
