'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletContext } from '@/context/WalletContext'
import { useCameraQRScanner } from '@/hooks/useCameraQRScanner'
import { useRedeemQR } from '@/hooks/useRedeemQR'
import { parseQRPayload } from '@/lib/qr'

export function QRScanner() {
  const router = useRouter()
  const { walletAddress } = useWalletContext()
  const { status, error, result, redeem, reset } = useRedeemQR(walletAddress)
  const [scanError, setScanError] = useState<string | null>(null)

  const handleDecode = useCallback((raw: string) => {
    if (status !== 'idle') return
    const payload = parseQRPayload(raw)
    if (!payload) {
      setScanError('Código QR inválido. Intenta de nuevo.')
      return
    }
    setScanError(null)
    redeem(payload)
  }, [status, redeem])

  const cameraActive = status === 'idle'
  const { videoRef, canvasRef, status: cameraStatus } = useCameraQRScanner(handleDecode, cameraActive)

  useEffect(() => {
    if (status !== 'success') return
    const t = setTimeout(() => router.push('/wallet'), 1800)
    return () => clearTimeout(t)
  }, [status, router])

  const handleRetry = () => {
    setScanError(null)
    reset()
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Escanear QR</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Apunta la cámara al código para recibir tu NFT
          </p>
        </div>

        {status === 'idle' && (
          <>
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-8 border-[3px] border-white/40 rounded-2xl pointer-events-none" />

              {cameraStatus === 'denied' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-6 text-center">
                  <p className="text-sm text-white">
                    Permiso de cámara denegado. Habilítalo en la configuración del navegador.
                  </p>
                </div>
              )}
              {cameraStatus === 'unsupported' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-6 text-center">
                  <p className="text-sm text-white">Tu navegador no soporta acceso a la cámara.</p>
                </div>
              )}
            </div>

            {scanError && (
              <p className="text-sm text-red-500 text-center mt-4">{scanError}</p>
            )}
          </>
        )}

        {status === 'pending' && (
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
