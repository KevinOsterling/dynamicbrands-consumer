'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePrivy, useLoginWithEmail } from '@privy-io/react-auth'
import { useWalletContext } from '@/context/WalletContext'
import { useRedeemQR } from '@/hooks/useRedeemQR'
import { parseQRSearchParams } from '@/lib/qr'
import { BACKEND_URL } from '@/lib/config'

export function RedeemFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramsKey = searchParams.toString()
  const payload = useMemo(() => parseQRSearchParams(searchParams), [paramsKey])
  const brandId = searchParams.get('brandId')

  const { authenticated } = usePrivy()
  const { walletAddress } = useWalletContext()
  const { status, error, result, redeem, reset } = useRedeemQR(walletAddress)
  const redeemedRef = useRef(false)
  const [brandName, setBrandName] = useState<string | null>(null)

  useEffect(() => {
    if (!brandId) return
    let cancelled = false

    fetch(`${BACKEND_URL}/brands/${brandId}/name`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!cancelled && data?.brandName) setBrandName(data.brandName)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [brandId])

  useEffect(() => {
    if (!authenticated || !walletAddress || !payload || redeemedRef.current) return
    redeemedRef.current = true
    redeem(payload)
  }, [authenticated, walletAddress, payload, redeem])

  useEffect(() => {
    if (status !== 'success') return
    const t = setTimeout(() => router.push('/wallet'), 1800)
    return () => clearTimeout(t)
  }, [status, router])

  const handleRetry = () => {
    redeemedRef.current = false
    reset()
  }

  if (!payload) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <p className="text-sm text-zinc-400 text-center max-w-xs">
          Este enlace de reclamo no es válido o está incompleto.
        </p>
      </main>
    )
  }

  if (!authenticated) {
    return <RedeemLanding brandName={brandName} />
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-lg mx-auto px-4 py-6">
        {(status === 'idle' || status === 'pending') && (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full border-4 border-zinc-700 border-t-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Acuñando tu NFT…</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-12">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border-l-4 border-emerald-400 shadow-sm p-6 mb-6">
              <span className="text-4xl" aria-hidden="true">🌱</span>
              <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-2">
                Brand NFT
              </p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {result?.brandName ?? (result?.brandId != null ? `Brand #${result.brandId}` : 'Tu nuevo NFT')}
              </p>
              <p className="text-sm text-emerald-500 mt-2">¡NFT acuñado con éxito!</p>
            </div>
            <button
              onClick={() => router.push('/wallet')}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full transition-colors"
            >
              Ver mi billetera
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              {error ?? 'No se pudo completar el mint.'}
            </p>
            <button
              onClick={handleRetry}
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

function RedeemLanding({ brandName }: { brandName: string | null }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const { sendCode, loginWithCode, state } = useLoginWithEmail()

  const isSendingCode = state.status === 'sending-code'
  const isSubmittingCode = state.status === 'submitting-code'
  const codeStep =
    state.status === 'awaiting-code-input' ||
    state.status === 'submitting-code' ||
    state.status === 'done'

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    await sendCode({ email })
  }

  async function handleLoginWithCode(e: React.FormEvent) {
    e.preventDefault()
    await loginWithCode({ code })
  }

  const error = state.status === 'error' ? state.error?.message ?? 'Ocurrió un error' : null

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-blue-500 opacity-90" />
            <div className="absolute bottom-0 left-1 w-10 h-10 rounded-full bg-red-600 opacity-90" />
            <div className="absolute bottom-0 right-1 w-10 h-10 rounded-full bg-green-500 opacity-90" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-1">
          {brandName ? `Reclama tu NFT de ${brandName}` : 'Reclama tu NFT'}
        </h1>
        <p className="text-sm text-zinc-400 text-center mb-10">
          Inicia sesión para recibir tu NFT de marca al instante
        </p>

        {!codeStep ? (
          <form onSubmit={handleSendCode} className="flex flex-col gap-4">
            <label className="text-sm text-zinc-300 font-medium">
              Ingresa tu correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={isSendingCode || !email}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold transition-colors"
            >
              {isSendingCode ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginWithCode} className="flex flex-col gap-4">
            <label className="text-sm text-zinc-300 font-medium">
              Revisa tu correo e ingresa el código
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
              className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={isSubmittingCode || code.length < 6}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold transition-colors"
            >
              {isSubmittingCode ? 'Verificando...' : 'Ingresar'}
            </button>
            <button
              type="button"
              onClick={() => setCode('')}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors text-center"
            >
              Volver a enviar código
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
