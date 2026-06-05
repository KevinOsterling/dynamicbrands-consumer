'use client'
import { createContext, useContext } from 'react'

interface WalletContextValue {
  walletAddress: string | null
}

export const WalletContext = createContext<WalletContextValue>({ walletAddress: null })

export function useWalletContext() {
  return useContext(WalletContext)
}
