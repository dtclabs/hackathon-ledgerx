import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { isEthereumAddress } from 'class-validator'

@Injectable()
export class AddressPipe implements PipeTransform {
  transform(value: string) {
    if (isEthereumAddress(value)) {
      return value
    }

    // Check if it's a valid Solana address
    if (this.isSolanaAddress(value)) {
      return value
    }

    throw new BadRequestException('Invalid address - must be a valid Ethereum or Solana address')
  }

  private isSolanaAddress(address: string): boolean {
    // Solana addresses are base58 encoded and typically 32-44 characters long
    if (!address || typeof address !== 'string') {
      return false
    }

    // Check length (Solana addresses are typically 32-44 characters)
    if (address.length < 32 || address.length > 44) {
      return false
    }

    // Check if it contains only valid base58 characters
    const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/
    if (!base58Regex.test(address)) {
      return false
    }

    // Additional check: Solana addresses should not contain 0, O, I, or l
    if (/[0OIl]/.test(address)) {
      return false
    }

    return true
  }
}
