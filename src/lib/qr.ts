export interface QRPayload {
  qrHash: `0x${string}`
  expiry: number
  signature: `0x${string}`
}

const BYTES32_RE = /^0x[0-9a-fA-F]{64}$/
const BYTES_RE = /^0x[0-9a-fA-F]+$/

function toQRPayload(qrHash: unknown, expiry: unknown, signature: unknown): QRPayload | null {
  if (typeof qrHash !== 'string' || !BYTES32_RE.test(qrHash)) return null
  if (typeof signature !== 'string' || !BYTES_RE.test(signature) || signature.length % 2 !== 0) return null

  const expiryNum = typeof expiry === 'number' ? expiry : Number(expiry)
  if (!Number.isFinite(expiryNum) || expiryNum <= 0) return null

  return { qrHash: qrHash as `0x${string}`, expiry: expiryNum, signature: signature as `0x${string}` }
}

// Assumed shape: { qrHash, expiry, signature } JSON-encoded into the QR image,
// mapping directly to BrandNFT.redeemQR(bytes32, uint256, bytes).
export function parseQRPayload(raw: string): QRPayload | null {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }

  if (typeof data !== 'object' || data === null) return null
  const { qrHash, expiry, signature } = data as Record<string, unknown>
  return toQRPayload(qrHash, expiry, signature)
}

// Same payload, read from the /redeem?qrHash=...&expiry=...&signature=... deep link instead of a JSON QR body.
export function parseQRSearchParams(params: URLSearchParams): QRPayload | null {
  return toQRPayload(params.get('qrHash'), params.get('expiry'), params.get('signature'))
}
