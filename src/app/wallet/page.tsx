'use client'
import { useWalletContext } from '@/context/WalletContext'
import { useAssets } from '@/hooks/useAssets'
import type { AssetItem } from '@/lib/types'

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function formatUsdc(n: number): string {
  return n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border-l-4 border-zinc-200 dark:border-zinc-700 shadow-sm p-4 animate-pulse">
      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-3" />
      <div className="h-7 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mb-2" />
      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-2/5" />
    </div>
  )
}

function QrIcon() {
  return (
    <svg
      width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" className="mx-auto text-zinc-300 dark:text-zinc-600"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="5" width="3" height="3" fill="currentColor" stroke="none" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
      <path d="M14 14h3v3h-3z" fill="currentColor" stroke="none" />
      <path d="M17 14h4" />
      <path d="M21 14v3h-4" />
      <path d="M14 17v4" />
      <path d="M17 21h4v-4" />
    </svg>
  )
}

function AssetCard({ asset }: { asset: AssetItem }) {
  const weeklyTotal =
    asset.weeklyRate != null ? asset.weeklyRate * asset.balance : null

  if (asset.type === 'brand_nft') {
    return (
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border-l-4 border-emerald-400 shadow-sm p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Brand NFT
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
              {asset.brandName ?? `Brand #${asset.brandId}`}
            </p>
            <p className="text-2xl font-bold text-emerald-500 mt-1 leading-none">
              {asset.balance}
              <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500 ml-1">NFTs</span>
            </p>
          </div>
          <span className="text-3xl select-none" aria-hidden="true">🌱</span>
        </div>
        {(weeklyTotal != null || asset.totalEarned != null) && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-1">
            {weeklyTotal != null && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 dark:text-zinc-500">Cashback semanal</span>
                <span className="text-xs font-semibold text-emerald-500">
                  ${formatUsdc(weeklyTotal)} USDC
                </span>
              </div>
            )}
            {asset.totalEarned != null && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 dark:text-zinc-500">Total ganado</span>
                <span className="text-xs font-semibold text-green-500">
                  ${formatUsdc(asset.totalEarned)} USDC
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (asset.type === 'usdc') {
    return (
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border-l-4 border-green-400 shadow-sm p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              USDC
            </p>
            <p className="text-2xl font-bold text-green-500 mt-1 leading-none">
              ${formatUsdc(asset.balance)}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Stablecoin · Base</p>
          </div>
          <span className="text-3xl select-none" aria-hidden="true">💵</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border-l-4 border-teal-400 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            DB-NFT
          </p>
          <p className="text-2xl font-bold text-teal-500 mt-1 leading-none">
            {asset.balance}
            <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500 ml-1">tokens</span>
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Dynamic Brands · Base</p>
        </div>
        <span className="text-3xl select-none" aria-hidden="true">🪙</span>
      </div>
    </div>
  )
}

export default function WalletPage() {
  const { walletAddress } = useWalletContext()
  const { assets, status, retry } = useAssets(walletAddress)

  const totalUsdc = assets.find(a => a.type === 'usdc')?.balance ?? 0
  const totalEarned = assets
    .filter(a => a.type === 'brand_nft')
    .reduce((sum, a) => sum + (a.totalEarned ?? 0), 0)

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Mi Billetera</h1>
          {walletAddress && (
            <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">
              {truncateAddress(walletAddress)}
            </p>
          )}
        </div>

        {/* USDC hero card */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 p-5 mb-6">
          <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            Balance USDC
          </p>
          {status === 'loading' ? (
            <div className="h-10 bg-zinc-200 dark:bg-zinc-700 rounded-lg w-36 animate-pulse" />
          ) : (
            <p className="text-4xl font-bold text-green-500 leading-none">
              ${formatUsdc(totalUsdc)}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
              Total ganado
            </p>
            {status === 'loading' ? (
              <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-28 animate-pulse" />
            ) : (
              <p className="text-xl font-bold text-green-500">
                ${formatUsdc(totalEarned)} USDC
              </p>
            )}
          </div>
        </div>

        {/* Assets section */}
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          Mis Activos
        </h2>

        {status === 'loading' && (
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Error cargando activos. Intenta de nuevo.
            </p>
            <button
              onClick={retry}
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {status === 'empty' && (
          <div className="text-center py-12">
            <QrIcon />
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4 max-w-xs mx-auto leading-relaxed">
              Aún no tienes activos. ¡Escanea un código QR para recibir tu primer NFT!
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col gap-3">
            {assets.map((asset, i) => (
              <AssetCard
                key={`${asset.type}-${asset.brandId ?? i}`}
                asset={asset}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
