import { toChecksumAddress } from 'web3-utils'

export const addressHelper = {
  formatAddressForBlockchain,
  isSolanaBlockchain,
  safeToChecksumAddress
}

/**
 * Format address according to blockchain requirements
 * - Ethereum addresses: Apply checksum
 * - Solana addresses: Keep as-is
 */
function formatAddressForBlockchain(address: string | null, blockchainId?: string): string | null {
  if (!address) {
    return null
  }

  // For Solana blockchain, return address as-is
  if (isSolanaBlockchain(blockchainId)) {
    return address
  }

  // For other blockchains (Ethereum, etc), apply checksum
  return safeToChecksumAddress(address)
}

/**
 * Check if blockchain is Solana
 */
function isSolanaBlockchain(blockchainId?: string): boolean {
  return blockchainId === 'solana'
}

/**
 * Safely apply checksum to address, fallback to original if it fails
 */
function safeToChecksumAddress(address: string): string {
  try {
    return toChecksumAddress(address)
  } catch (error) {
    // If checksum fails (e.g., for Solana addresses), return original
    return address
  }
}