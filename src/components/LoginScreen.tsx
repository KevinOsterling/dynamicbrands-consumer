'use client'
import { useState } from 'react'
import { useLoginWithEmail } from '@privy-io/react-auth'

export function LoginScreen() {
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
        {/* Three Circles Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-blue-500 opacity-90" />
            <div className="absolute bottom-0 left-1 w-10 h-10 rounded-full bg-red-600 opacity-90" />
            <div className="absolute bottom-0 right-1 w-10 h-10 rounded-full bg-green-500 opacity-90" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-1">Dynamic Brands</h1>
        <p className="text-sm text-zinc-400 text-center mb-10">Tu billetera de marcas</p>

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
