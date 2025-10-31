import { Web3Provider } from '@ethersproject/providers'
import { toChecksumAddress, keccak256 } from 'ethereumjs-util'
import { captureException as sentryCaptureException } from '@sentry/nextjs'

export async function getStorageAt(
  provider: Web3Provider,
  address: string,
  position: string,
  block = 'latest'
): Promise<string> {
  const storage = provider && (await provider.send('eth_getStorageAt', [address, position, block]))
  const padded = storage && storage.replace(/^0x/, '').padStart(64, '0')
  return padded && `0x${padded}`
}

export async function getImplementationAddress(provider: Web3Provider, address: string): Promise<string> {
  if (!address) {
    return ''
  }
  try {
    const storage = await getStorageFallback(
      provider,
      address,
      toEip1967Hash('eip1967.proxy.implementation'),
      toFallbackEip1967Hash('org.zeppelinos.proxy.implementation')
    )

    if (isEmptySlot(storage)) {
      return ''
    }

    return parseAddressFromStorage(storage)
  } catch (error) {
    sentryCaptureException(error)
    console.log(error)
    return ''
  }
}

async function getStorageFallback(provider: Web3Provider, address: string, ...slots: string[]): Promise<string> {
  let storage = '0x0000000000000000000000000000000000000000000000000000000000000000' // default: empty slot

  for (const slot of slots) {
    storage = getStorageAt && (await getStorageAt(provider, address, slot))
    if (!isEmptySlot(storage)) {
      break
    }
  }

  return storage
}

export function isEmptySlot(storage: string): boolean {
  return BigInt(storage.replace(/^(0x)?/, '0x')) === BigInt(0)
}

function parseAddressFromStorage(storage: string): string {
  const address = parseAddress(storage)
  if (address === undefined) {
    throw new Error(`Value in storage is not an address (${storage})`)
  }
  return address
}

/**
 * Parses an address from a hex string which may come from storage or a returned address via eth_call.
 *
 * @param addressString The address hex string.
 * @returns The parsed checksum address, or undefined if the input string is not an address.
 */
export function parseAddress(addressString: string): string | undefined {
  const buf = Buffer.from(addressString.replace(/^0x/, ''), 'hex')
  if (!buf.slice(0, 12).equals(Buffer.alloc(12, 0))) {
    return undefined
  }
  const address = `0x${buf.toString('hex', 12, 32)}` // grab the last 20 bytes
  return toChecksumAddress(address)
}

export function toFallbackEip1967Hash(label: string): string {
  return `0x${keccak256(Buffer.from(label)).toString('hex')}`
}

export function toEip1967Hash(label: string): string {
  const hash = keccak256(Buffer.from(label))
  const bigNumber = BigInt(`0x${hash.toString('hex')}`) - BigInt(1)
  return `0x${bigNumber.toString(16)}`
}
