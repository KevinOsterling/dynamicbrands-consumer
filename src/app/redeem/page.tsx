import { Suspense } from 'react'
import { RedeemFlow } from '@/components/RedeemFlow'

function RedeemFallback() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-zinc-700 border-t-blue-500 animate-spin" />
    </div>
  )
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<RedeemFallback />}>
      <RedeemFlow />
    </Suspense>
  )
}
