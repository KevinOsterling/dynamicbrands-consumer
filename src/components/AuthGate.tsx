'use client'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { LoginScreen } from './LoginScreen'
import { WalletContext } from '@/context/WalletContext'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = usePrivy()
  const { wallets, ready: walletsReady } = useWallets()

  if (!ready) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-zinc-700 border-t-blue-500 animate-spin" />
      </div>
    )
  }

  if (!authenticated) {
    return <LoginScreen />
  }

  const walletAddress = walletsReady
    ? (wallets.find(w => w.walletClientType === 'privy' || w.walletClientType === 'privy-v2')?.address ?? null)
    : null

  return (
    <WalletContext.Provider value={{ walletAddress }}>
      {children}
    </WalletContext.Provider>
  )
}
