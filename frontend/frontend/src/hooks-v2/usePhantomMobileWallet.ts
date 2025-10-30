import { useCallback, useState } from 'react'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'
import nacl from 'tweetnacl'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'react-toastify'
import { log } from '@/utils-v2/logger'
import bs58 from 'bs58'
import { useCreateProvidersWalletMutation } from '@/api-v2/providers-wallet-api'

interface SignInResult {
  address: string
  signature: string
  nonce: string
}

// 🧩 Normalize address returned from Phantom (Base64 → Base58)
function normalizeAddress(address: string): string {
  const clean = address.trim()

  // If it's already Base58
  if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(clean)) return clean

  // Try decode from Base64
  try {
    const bytes = Buffer.from(clean, 'base64')
    return bs58.encode(bytes)
  } catch {
    throw new Error(`Invalid address format (not base58 or base64): ${address}`)
  }
}

export const usePhantomMobileWallet = () => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createProvidersWalletApi] = useCreateProvidersWalletMutation()

  const connectPhantomMobile = useCallback(async (): Promise<SignInResult | null> => {
    setIsConnecting(true)
    setError(null)

    try {
      const result = await transact(async (wallet) => {
        // 1️⃣ Authorize Phantom Mobile
        const { accounts } = await wallet.authorize({
          cluster: 'mainnet-beta',
          identity: {
            name: 'LedgerX',
            uri: 'https://ledgerx.30781337.com',
            icon: '/svg/logos/ledgerx-logo.svg'
          }
        })

        if (!accounts?.length) throw new Error('No accounts returned from wallet')

        // 🧩 Normalize address to Base58
        const rawAddress = accounts[0].address
        const normalizedAddress = normalizeAddress(rawAddress)
        const publicKey = new PublicKey(normalizedAddress)

        // 2️⃣ Get nonce from backend (same as desktop)
        const { data: nonceResp }: any = await createProvidersWalletApi({
          address: publicKey.toBase58(),
          name: ''
        })
        const nonce = nonceResp?.data?.nonce
        if (!nonce) throw new Error('Unable to retrieve nonce from backend')

        // 3️⃣ Sign backend nonce
        const encoded = new TextEncoder().encode(nonce)
        const [signature] = await wallet.signMessages({
          addresses: [rawAddress],
          payloads: [encoded]
        })

        // 4️⃣ Verify signature
        const isValid = nacl.sign.detached.verify(encoded, signature, publicKey.toBytes())
        if (!isValid) throw new Error('Invalid signature')

        return {
          address: publicKey.toBase58(),
          signature: Buffer.from(signature).toString('base64'),
          nonce
        }
      })

      log.info('✅ Phantom mobile wallet connected successfully', ['Phantom'], {
        address: result?.address
      })

      return result
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to connect with Phantom mobile wallet'
      setError(errorMessage)
      log.critical(errorMessage, ['Phantom Mobile Wallet'], err, 'usePhantomMobileWallet')
      toast.error(errorMessage)
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [createProvidersWalletApi])

  return {
    connectPhantomMobile,
    isConnecting,
    error
  }
}
