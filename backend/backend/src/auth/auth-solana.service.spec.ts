import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { AccountsEntityService } from '../shared/entity-services/account/accounts.entity-service'
import { AuthWhitelistsEntityService } from '../shared/entity-services/auth-whitelists/auth-whitelists.entity-service'
import { EmailEntityService } from '../shared/entity-services/providers/email.entity-service'
import { WalletsEntityService } from '../shared/entity-services/providers/wallets.entity-service'
import { XeroEntityService } from '../shared/entity-services/providers/xero-account.entity-service'
import { LoggerService } from '../shared/logger/logger.service'
import { HttpService } from '@nestjs/axios'
import { Auth0Service } from '../domain/integrations/auth0/auth0.service'
import { EProvider } from './interfaces'
import { AuthWallet } from '../shared/entity-services/providers/wallet.entity'
import { Account } from '../shared/entity-services/account/account.entity'
import * as nacl from 'tweetnacl'
import { PublicKey, Keypair } from '@solana/web3.js'

describe('AuthService - Solana Wallet Tests', () => {
  let service: AuthService
  let walletsService: WalletsEntityService
  let accountsService: AccountsEntityService

  // Test data
  const solanaKeypair = Keypair.generate()
  const solanaAddress = solanaKeypair.publicKey.toString()
  const ethereumAddress = '0x742d35Cc6735C0532f3e4C8ee1d0e73E6f9A1234'
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: WalletsEntityService,
          useValue: {
            findOneByAddress: jest.fn(),
            generateNonce: jest.fn().mockReturnValue('test-nonce-123')
          }
        },
        {
          provide: AccountsEntityService,
          useValue: {
            findOne: jest.fn()
          }
        },
        {
          provide: AuthWhitelistsEntityService,
          useValue: {
            findBy: jest.fn()
          }
        },
        {
          provide: EmailEntityService,
          useValue: {}
        },
        {
          provide: XeroEntityService,
          useValue: {}
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token')
          }
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test')
          }
        },
        {
          provide: LoggerService,
          useValue: {
            error: jest.fn()
          }
        },
        {
          provide: HttpService,
          useValue: {}
        },
        {
          provide: Auth0Service,
          useValue: {}
        }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)
    walletsService = module.get<WalletsEntityService>(WalletsEntityService)
    accountsService = module.get<AccountsEntityService>(AccountsEntityService)
  })

  describe('Solana Address Validation', () => {
    it('should validate a correct Solana address', () => {
      const isValid = (service as any).isSolanaAddress(solanaAddress)
      expect(isValid).toBe(true)
    })

    it('should reject invalid Solana addresses', () => {
      const invalidAddresses = [
        '', // empty
        '123', // too short
        '0x742d35Cc6735C0532f3e4C8ee1d0e73E6f9A1234', // ethereum address
        'invalid-base58-0OIl', // contains invalid characters
        'a'.repeat(50) // too long
      ]

      invalidAddresses.forEach(address => {
        const isValid = (service as any).isSolanaAddress(address)
        expect(isValid).toBe(false)
      })
    })

    it('should still validate Ethereum addresses', () => {
      const isValid = (service as any).isSolanaAddress(ethereumAddress)
      expect(isValid).toBe(false) // Should be false for isSolanaAddress
    })
  })

  describe('Solana Signature Verification', () => {
    it('should verify a valid Solana signature', () => {
      const message = 'Logging into LedgerX. This will give you access to all safes owned by this account. (test-nonce-123)'
      const messageBytes = new TextEncoder().encode(message)
      
      // Sign the message with the test keypair
      const signature = nacl.sign.detached(messageBytes, solanaKeypair.secretKey)
      const signatureBase64 = Buffer.from(signature).toString('base64')
      
      const isValid = (service as any).verifySolanaSignature(solanaAddress, message, signatureBase64)
      expect(isValid).toBe(true)
    })

    it('should reject invalid Solana signatures', () => {
      const message = 'Logging into LedgerX. This will give you access to all safes owned by this account. (test-nonce-123)'
      const invalidSignature = 'invalid-signature'
      
      const isValid = (service as any).verifySolanaSignature(solanaAddress, message, invalidSignature)
      expect(isValid).toBe(false)
    })

    it('should reject signature from wrong keypair', () => {
      const message = 'Logging into LedgerX. This will give you access to all safes owned by this account. (test-nonce-123)'
      const messageBytes = new TextEncoder().encode(message)
      
      // Sign with different keypair
      const wrongKeypair = Keypair.generate()
      const signature = nacl.sign.detached(messageBytes, wrongKeypair.secretKey)
      const signatureBase64 = Buffer.from(signature).toString('base64')
      
      const isValid = (service as any).verifySolanaSignature(solanaAddress, message, signatureBase64)
      expect(isValid).toBe(false)
    })
  })

  describe('Wallet Login Integration', () => {
    it('should successfully login with Solana wallet', async () => {
      const message = 'Logging into LedgerX. This will give you access to all safes owned by this account. (test-nonce-123)'
      const messageBytes = new TextEncoder().encode(message)
      const signature = nacl.sign.detached(messageBytes, solanaKeypair.secretKey)
      const signatureBase64 = Buffer.from(signature).toString('base64')

      // Mock wallet and account
      const mockWallet = new AuthWallet()
      mockWallet.id = 'wallet-id'
      mockWallet.address = solanaAddress
      mockWallet.nonce = 'test-nonce-123'

      const mockAccount = new Account()
      mockAccount.id = 'account-id'
      mockAccount.name = solanaAddress

      jest.spyOn(walletsService, 'findOneByAddress').mockResolvedValue(mockWallet)
      jest.spyOn(accountsService, 'findOne').mockResolvedValue(mockAccount)

      const result = await service.login({
        address: solanaAddress,
        signature: signatureBase64,
        token: '',
        provider: EProvider.WALLET
      })

      expect(result).toBeDefined()
      expect(result.accessToken).toBe('mock-jwt-token')
      expect(result.account).toBe(mockAccount)
    })

    it('should fail login with invalid Solana signature', async () => {
      const mockWallet = new AuthWallet()
      mockWallet.id = 'wallet-id'
      mockWallet.address = solanaAddress
      mockWallet.nonce = 'test-nonce-123'

      const mockAccount = new Account()
      mockAccount.id = 'account-id'
      mockAccount.name = solanaAddress

      jest.spyOn(walletsService, 'findOneByAddress').mockResolvedValue(mockWallet)
      jest.spyOn(accountsService, 'findOne').mockResolvedValue(mockAccount)

      await expect(service.login({
        address: solanaAddress,
        signature: 'invalid-signature',
        token: '',
        provider: EProvider.WALLET
      })).rejects.toThrow(BadRequestException)
    })
  })

  describe('Mixed Wallet Support', () => {
    it('should handle both Ethereum and Solana addresses in the same system', () => {
      // Test Ethereum detection
      const ethValid = (service as any).verifyWalletSignature(ethereumAddress, 'test message', 'test-signature')
      // This will fail but shouldn't crash
      expect(typeof ethValid).toBe('boolean')

      // Test Solana detection  
      const message = 'test message'
      const messageBytes = new TextEncoder().encode(message)
      const signature = nacl.sign.detached(messageBytes, solanaKeypair.secretKey)
      const signatureBase64 = Buffer.from(signature).toString('base64')
      
      const solanaValid = (service as any).verifyWalletSignature(solanaAddress, message, signatureBase64)
      expect(solanaValid).toBe(true)
    })
  })
})