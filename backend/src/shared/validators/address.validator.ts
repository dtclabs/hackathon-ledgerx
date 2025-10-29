import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { isEthereumAddress } from 'class-validator'

@ValidatorConstraint({ async: false })
export class IsEthereumOrSolanaAddressConstraint implements ValidatorConstraintInterface {
  validate(address: string) {
    // Check if it's a valid Ethereum address
    if (isEthereumAddress(address)) {
      return true
    }
    
    // Check if it's a valid Solana address
    if (this.isSolanaAddress(address)) {
      return true
    }
    
    return false
  }

  defaultMessage() {
    return 'Address must be a valid Ethereum or Solana address'
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

export function IsEthereumOrSolanaAddress(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEthereumOrSolanaAddressConstraint,
    })
  }
}
