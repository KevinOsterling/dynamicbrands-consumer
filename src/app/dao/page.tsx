'use client'
import { useState, useEffect } from 'react'
import { useProposals } from '@/hooks/useProposals'
import { useAssets } from '@/hooks/useAssets'
import { useWalletContext } from '@/context/WalletContext'
import type { Proposal } from '@/lib/types'

// Phase 1: hardcoded to China Wok (brandId=1)
const BRAND_ID = 1
const BRAND_NAME = 'China Wok'

const STATUS_LABEL: Record<0 | 1 | 2 | 3, string> = {
  0: 'Activa',
  1: 'Aprobada',
  2: 'Rechazada',
  3: 'Implementada',
}

const STATUS_CLASSES: Record<0 | 1 | 2 | 3, string> = {
  0: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  1: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  2: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',
  3: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
}

function deriveTitle(p: Proposal): string {
  if (p.title) return p.title
  const first = p.description.split('\n')[0].trim()
  return first.length > 80 ? first.slice(0, 77) + '...' : first
}

function VoteBar({ votesFor, votesAgainst }: { votesFor: number; votesAgainst: number }) {
  const total = votesFor + votesAgainst
  const yesPercent = total === 0 ? 50 : Math.round((votesFor / total) * 100)

  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
        <span className="text-emerald-500">✅ Sí — {votesFor}</span>
        <span className="text-red-400">{votesAgainst} — No ❌</span>
      </div>
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${yesPercent}%` }}
        />
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border-l-4 border-zinc-200 dark:border-zinc-700 shadow-sm p-4 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-20" />
        <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded-full w-16" />
      </div>
      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full mb-1" />
      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3 mb-4" />
      <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full w-full" />
    </div>
  )
}

interface ProposalCardProps {
  proposal: Proposal
  nftBalance: number | null
}

function ProposalCard({ proposal, nftBalance }: ProposalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [formattedDate, setFormattedDate] = useState('')
  const isActive = proposal.status === 0
  const title = deriveTitle(proposal)

  useEffect(() => {
    setFormattedDate(
      new Date(proposal.submittedAt).toLocaleDateString('es-PE', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    )
  }, [proposal.submittedAt])

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 border-l-4 border-blue-400 shadow-sm">

      {/* Clickable header — tap to expand */}
      <div
        className="flex items-start gap-2 p-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(v => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              {proposal.brandName ?? BRAND_NAME}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CLASSES[proposal.status]}`}>
                {STATUS_LABEL[proposal.status]}
              </span>
              <svg
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {title}
          </p>
          {!isExpanded && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
              {proposal.description}
            </p>
          )}
        </div>
      </div>

      {/* Vote bar — always visible */}
      <div className="px-4 pb-4">
        <VoteBar votesFor={proposal.votesFor} votesAgainst={proposal.votesAgainst} />
      </div>

      {/* Expanded detail section */}
      {isExpanded && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-4">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">{title}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {proposal.description}
          </p>

          {isActive && (
            <div className="mt-4">
              <div className="flex gap-3">
                <button
                  disabled
                  title="La votación on-chain estará disponible pronto"
                  className="flex-1 py-2.5 rounded-xl border-2 border-emerald-400/40 text-emerald-500 text-sm font-semibold opacity-50 cursor-not-allowed"
                >
                  ✅ Votar Sí
                </button>
                <button
                  disabled
                  title="La votación on-chain estará disponible pronto"
                  className="flex-1 py-2.5 rounded-xl border-2 border-red-400/40 text-red-400 text-sm font-semibold opacity-50 cursor-not-allowed"
                >
                  ❌ Votar No
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center mt-2">
                La votación on-chain estará disponible pronto
              </p>
              {nftBalance != null && nftBalance > 0 && (
                <p className="text-[11px] text-blue-500 text-center mt-1 font-medium">
                  Tu voto vale {nftBalance} NFT{nftBalance !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            {formattedDate
              ? <p className="text-xs text-zinc-400 dark:text-zinc-500">Enviado: {formattedDate}</p>
              : <span />
            }
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false) }}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              Cerrar ↑
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DaoPage() {
  const { walletAddress } = useWalletContext()
  const { proposals, status, retry } = useProposals()
  const { assets } = useAssets(walletAddress)

  const nftBalance = assets.find(
    a => a.type === 'brand_nft' && a.brandId === BRAND_ID
  )?.balance ?? null

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Gobernanza</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Vota en las propuestas de tus marcas
          </p>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Error cargando propuestas. Intenta de nuevo.
            </p>
            <button
              onClick={retry}
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty */}
        {status === 'empty' && (
          <div className="text-center py-12">
            <p className="text-5xl mb-3">🗳️</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Aún no tienes propuestas activas. ¡Adquiere NFTs de una marca para participar en su gobernanza!
            </p>
          </div>
        )}

        {/* Proposals list */}
        {status === 'success' && (
          <div className="flex flex-col gap-3">
            {proposals.map(p => (
              <ProposalCard
                key={p.proposalId}
                proposal={p}
                nftBalance={nftBalance}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
