import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { recoverPersonalSignature } from 'eth-sig-util'
import { bufferToHex } from 'ethereumjs-util'
import { PublicKey } from '@solana/web3.js'
import * as nacl from 'tweetnacl'
import { isEthereumAddress } from 'class-validator'
import { SignMessage } from '../shared/constants'
import { Account } from '../shared/entity-services/account/account.entity'
import { AccountsEntityService } from '../shared/entity-services/account/accounts.entity-service'
import { AuthWhitelistsEntityService } from '../shared/entity-services/auth-whitelists/auth-whitelists.entity-service'
import { AuthEmail } from '../shared/entity-services/providers/email.entity'
import { EmailEntityService } from '../shared/entity-services/providers/email.entity-service'
import { AuthTwitter } from '../shared/entity-services/providers/twitter.entity'
import { AuthWallet } from '../shared/entity-services/providers/wallet.entity'
import { WalletsEntityService } from '../shared/entity-services/providers/wallets.entity-service'
import { AuthXero } from '../shared/entity-services/providers/xero-account.entity'
import { XeroEntityService } from '../shared/entity-services/providers/xero-account.entity-service'
import { jwtTokenHelper } from '../shared/helpers/jwtToken.helper'
import { LoggerService } from '../shared/logger/logger.service'
import { jwtConstants } from './constants'
import {
  AuthorizationDto,
  AuthorizationResponseDto,
  EProvider,
  JwtPayload,
  LoginAuthDto,
  SignUpAuthDto
} from './interfaces'
import { HttpService } from '@nestjs/axios'
import { dateHelper } from '../shared/helpers/date.helper'
import { Auth0Service } from '../domain/integrations/auth0/auth0.service'

@Injectable()
export class AuthService {
  constructor(
    private walletsService: WalletsEntityService,
    private emailService: EmailEntityService,
    private accountsService: AccountsEntityService,
    private authWhitelistEntityService: AuthWhitelistsEntityService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private logger: LoggerService,
    private xeroEntityService: XeroEntityService,
    private httpService: HttpService,
    private auth0Service: Auth0Service
  ) {}

  async login(authDto: LoginAuthDto): Promise<{ accessToken: string; account: Account } | null> {
    const { address, signature, token, provider = EProvider.EMAIL } = authDto

    await this.checkWhitelistedAuth(provider, token, address)

    const { account, auth } = await this.getAccount({
      address,
      token,
      provider
    })

    if (!account) {
      return null
    }

    try {
      if (provider === EProvider.EMAIL) {
        const jwtDecoded = await jwtTokenHelper.parseJWT(token)

        if (!jwtDecoded) {
          throw new BadRequestException('Token is not valid')
        }

        const accessToken = this.generateEmailAccessToken({
          verifierId: jwtDecoded.verifierId,
          authId: auth.id,
          accountId: account.id,
          provider: provider
        })
        return {
          accessToken,
          account
        }
      } else if (provider === EProvider.WALLET) {
        const msg = `${SignMessage} (${(auth as AuthWallet).nonce})`
        
        // Verify signature based on address type
        const isValidSignature = this.verifyWalletSignature(address, msg, signature)
        
        if (!isValidSignature) {
          throw new BadRequestException('Signature is not valid')
        }

        const accessToken = this.generateWalletAccessToken({
          address,
          accountId: account.id,
          walletId: auth.id,
          provider: provider
        })
        return {
          accessToken,
          account
        }
      } else if (provider === EProvider.XERO) {
        const accessToken = this.generateXeroAccessToken({
          authId: auth.id,
          accountId: account.id,
          provider: provider
        })
        return {
          accessToken,
          account
        }
      } else {
        throw new BadRequestException()
      }
    } catch (error) {
      this.logger.error(error)
      throw new UnauthorizedException('Invalid token')
    }
  }

  private async getAccessToken(authDto: AuthorizationDto) {
    let token: string = null

    switch (authDto.provider) {
      case EProvider.EMAIL:
      case EProvider.XERO:
        const code = authDto.code
        token = await this.auth0Service.getAccessToken(code)
        break
    }
    return token
  }

  private async checkWhitelistedAuth(
    provider: EProvider | EProvider.EMAIL | EProvider.XERO | EProvider.WALLET | EProvider.TWITTER,
    token: string,
    address: string
  ) {
    const env = this.configService.get('DEPLOYMENT_ENV')?.toLowerCase()

    // TODO: remove the xero domain check later after testing is done
    if (['develop', 'staging', 'demo'].includes(env)) {
      if (
        ![EProvider.EMAIL, EProvider.XERO].includes(provider) ||
        !(await jwtTokenHelper.parseJWT(token))?.email?.endsWith('@LedgerX')
      ) {
        let identifier: string

        switch (provider) {
          case EProvider.XERO:
          case EProvider.EMAIL:
            identifier = (await jwtTokenHelper.parseJWT(token))?.email
            break
          case EProvider.WALLET:
            identifier = address
            break
        }

        const authWhitelist = await this.authWhitelistEntityService.findBy(identifier, provider)

        if (!authWhitelist)
          throw new BadRequestException('Invalid email domain. Please reach out to our team to find out more.')
      }
    }
  }

  generateAccessToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, { expiresIn: jwtConstants.tokenExpiration })
  }

  generateEmailAccessToken(params: { verifierId: string; authId: string; accountId: string; provider: EProvider }) {
    return this.generateAccessToken({
      address: '',
      verifierId: params.verifierId,
      authId: params.authId,
      accountId: params.accountId,
      walletId: '',
      provider: params.provider,
      organizationId: ''
    })
  }

  generateWalletAccessToken(params: { address: string; walletId: string; accountId: string; provider: EProvider }) {
    return this.generateAccessToken({
      address: params.address,
      verifierId: '',
      accountId: params.accountId,
      authId: '',
      walletId: params.walletId,
      provider: params.provider,
      organizationId: ''
    })
  }

  generateXeroAccessToken(params: { authId: string; accountId: string; provider: EProvider }) {
    return this.generateAccessToken({
      address: '',
      verifierId: '',
      authId: params.authId,
      accountId: params.accountId,
      walletId: '',
      provider: params.provider,
      organizationId: ''
    })
  }

  async signUp(authDto: SignUpAuthDto): Promise<AuthorizationResponseDto> {
    const signUpCred = await this.login(authDto)
    if (signUpCred) {
      return {
        ...signUpCred,
        isNewAccount: false
      }
    }

    const { token, provider = EProvider.EMAIL } = authDto

    // Get user info from Auth0 instead of just parsing JWT
    let userInfo
    let jwtDecoded
    
    try {
      jwtDecoded = await jwtTokenHelper.parseJWT(token)
      if (!jwtDecoded) {
        throw new BadRequestException('Token is not valid')
      }
      
      if (provider === EProvider.EMAIL) {
        userInfo = await this.auth0Service.getUserInfo(token)
      }
    } catch (error) {
      this.logger.error('Failed to process token in signUp', error)
      throw new BadRequestException('Token is not valid')
    }

    const email = userInfo?.email || jwtDecoded.email
    const verifierId = userInfo?.sub || jwtDecoded.verifierId
    const profileImage = userInfo?.picture || jwtDecoded.profileImage

    this.logger.error('DEBUG: SignUp user data', { email, verifierId, profileImage })

    if (!email || !verifierId) {
      throw new BadRequestException('Missing required user information')
    }

    try {
      const newAccount = new Account()
      newAccount.firstName = authDto.firstName || userInfo?.given_name || ''
      newAccount.lastName = authDto.lastName || userInfo?.family_name || ''
      newAccount.agreementSignedAt = authDto.agreementSignedAt
      newAccount.image = profileImage

      if (provider === EProvider.EMAIL) {
        // Check if user already exists by email or verifierId
        const existingEmailAuth = await this.emailService.findOne({ 
          where: [
            { email },
            { verifierId }
          ]
        })

        if (existingEmailAuth) {
          this.logger.error('DEBUG: User already exists', { email, verifierId, existingEmailAuth: !!existingEmailAuth })
          throw new BadRequestException('User already exists')
        }

        const emailAccount = new AuthEmail()
        emailAccount.email = email
        emailAccount.verifierId = verifierId
        newAccount.emailAccounts = [emailAccount]
        newAccount.name = email

        this.logger.error('DEBUG: Creating email account', { email, verifierId })

        const createdEmailAccount = await this.emailService.create(emailAccount)
        const createdAccount = await this.accountsService.create(newAccount)

        const accessToken = this.generateEmailAccessToken({
          verifierId: verifierId,
          authId: createdEmailAccount.id,
          accountId: createdAccount.id,
          provider: provider
        })

        return {
          accessToken,
          account: createdAccount,
          isNewAccount: true
        }
      } else if (provider === EProvider.WALLET) {
        const wallet = new AuthWallet()
        wallet.address = authDto.address
        const nonce = this.walletsService.generateNonce()
        wallet.nonce = nonce

        newAccount.walletAccounts = [wallet]
        newAccount.name = authDto.address
        await this.walletsService.add(wallet)
        await this.accountsService.create(newAccount)
        wallet.nonce = `${SignMessage} (${nonce})`
      } else if (provider === EProvider.XERO) {
        const xeroAccount = new AuthXero()
        xeroAccount.email = jwtDecoded.email
        xeroAccount.xeroUserId = jwtDecoded.xeroUserId
        newAccount.xeroAccounts = [xeroAccount]
        newAccount.name = jwtDecoded.email

        const createdXeroAccount = await this.xeroEntityService.create(xeroAccount)
        const createdAccount = await this.accountsService.create(newAccount)

        const accessToken = this.generateXeroAccessToken({
          authId: createdXeroAccount.id,
          accountId: createdAccount.id,
          provider: provider
        })

        return {
          accessToken,
          account: createdAccount,
          isNewAccount: true
        }
      } else {
        throw new BadRequestException('Unknown provider')
      }
    } catch (error) {
      this.logger.error(error)
      throw new UnauthorizedException('Invalid token')
    }
  }

  async authorize(authDto: AuthorizationDto): Promise<AuthorizationResponseDto> {
    const token = await this.getAccessToken(authDto)
    const userinfo = await this.getUserInfo(authDto.provider, token)
    return this.signUp({
      token,
      provider: authDto.provider,
      address: authDto.address,
      agreementSignedAt: dateHelper.getUTCTimestamp(),
      signature: authDto.signature,
      firstName: userinfo?.given_name,
      lastName: userinfo?.family_name
    })
  }

  async getAccount(params: {
    address: string
    token: string
    provider: EProvider
  }): Promise<{ account: Account | null; auth: AuthEmail | AuthTwitter | AuthWallet | AuthXero | null }> {
    const { address, token, provider = EProvider.EMAIL } = params
    const empty = {
      account: null,
      auth: null
    }

    try {
      if (provider === EProvider.EMAIL) {
        this.logger.error('DEBUG: Starting JWT processing', { tokenLength: token.length })
        
        // First verify the JWT token 
        let jwtDecoded
        try {
          jwtDecoded = await jwtTokenHelper.parseJWT(token)
          this.logger.error('DEBUG: JWT decoded successfully', { jwtDecoded })
        } catch (error) {
          this.logger.error('DEBUG: JWT parsing failed', error)
          throw new BadRequestException('Token is not valid - JWT parsing failed')
        }

        if (!jwtDecoded) {
          this.logger.error('DEBUG: JWT decoded is null')
          throw new BadRequestException('Token is not valid - JWT is null')
        }

        // Get user info from Auth0
        let userInfo
        try {
          userInfo = await this.auth0Service.getUserInfo(token)
          this.logger.error('DEBUG: UserInfo retrieved', { userInfo })
        } catch (error) {
          this.logger.error('DEBUG: Failed to get user info from Auth0', error)
          throw new BadRequestException('Token is not valid - UserInfo failed')
        }

        // Use email from userInfo or JWT
        const email = userInfo.email || jwtDecoded.email
        const verifierId = userInfo.sub || jwtDecoded.verifierId

        this.logger.error('DEBUG: Processing user data', { email, verifierId })

        if (!email) {
          this.logger.error('DEBUG: No email found')
          throw new BadRequestException('No email found in token')
        }

        const auth = await this.emailService.findOne({ where: { verifierId } })
        this.logger.error('DEBUG: Auth lookup result', { auth: !!auth })
        
        if (!auth) {
          return empty
        }
        
        const account = await this.accountsService.findOne({ where: { emailAccounts: { id: auth.id } } })
        this.logger.error('DEBUG: Account lookup result', { account: !!account })
        
        if (!account) {
          return empty
        }

        return {
          auth,
          account
        }
      } else if (provider === EProvider.WALLET) {
        const auth = await this.walletsService.findOneByAddress(address)
        if (!auth) {
          return empty
        }

        const account = await this.accountsService.findOne({ where: { walletAccounts: { id: auth.id } } })

        if (!account) {
          return empty
        }

        return {
          auth,
          account
        }
      } else if (provider === EProvider.XERO) {
        const jwtDecoded = await jwtTokenHelper.parseJWT(token)
        const auth = await this.xeroEntityService.findOneByXeroUserId(jwtDecoded.xeroUserId)
        if (!auth) {
          return empty
        }

        const account = await this.accountsService.findOne({ where: { xeroAccounts: { id: auth.id } } })

        if (!account) {
          return empty
        }

        return {
          auth,
          account
        }
      }
    } catch (e) {
      this.logger.error(e, { params })
      throw new BadRequestException('Token is not valid')
    }
    throw new BadRequestException(`Unknown provider`)
  }

  private async getUserInfo(provider: EProvider, providerAccessToken: string) {
    switch (provider) {
      case EProvider.EMAIL:
      case EProvider.XERO:
        return await this.auth0Service.getUserInfo(providerAccessToken)
      case EProvider.WALLET:
        return null
    }
    return null
  }

  private verifyWalletSignature(address: string, message: string, signature: string): boolean {
    try {
      // SOL: Check Solana addresses first for better performance
      if (this.isSolanaAddress(address)) {
        this.logger.debug('SOL: Processing Solana wallet signature', { address })
        return this.verifySolanaSignature(address, message, signature)
      }
      
      // Fallback to Ethereum for legacy support
      if (isEthereumAddress(address)) {
        this.logger.debug('Legacy EVM: Processing Ethereum wallet signature', { address })
        return this.verifyEthereumSignature(address, message, signature)
      }
      
      this.logger.error('Unknown address format - not Solana or Ethereum', { address })
      return false
    } catch (error) {
      this.logger.error('Error verifying wallet signature', { address, error })
      return false
    }
  }

  private verifyEthereumSignature(address: string, message: string, signature: string): boolean {
    try {
      const msgBufferHex = bufferToHex(Buffer.from(message, 'utf8'))
      const recoverAddress = recoverPersonalSignature({
        data: msgBufferHex,
        sig: signature
      })
      
      return address.toLowerCase() === recoverAddress.toLowerCase()
    } catch (error) {
      this.logger.error('Error verifying Ethereum signature', { address, error })
      return false
    }
  }

  private verifySolanaSignature(address: string, message: string, signature: string): boolean {
    try {
      // Convert address to PublicKey
      const publicKey = new PublicKey(address)
      
      // Convert message to Uint8Array
      const messageBytes = new TextEncoder().encode(message)
      
      // Convert signature from base64 or hex to Uint8Array
      let signatureBytes: Uint8Array
      try {
        // Try base64 first (most common for Solana wallets)
        signatureBytes = new Uint8Array(Buffer.from(signature, 'base64'))
      } catch {
        try {
          // Try hex as fallback
          signatureBytes = new Uint8Array(Buffer.from(signature.replace('0x', ''), 'hex'))
        } catch {
          // If neither works, assume it's already a Uint8Array or array
          signatureBytes = new Uint8Array(signature as any)
        }
      }
      
      // Verify the signature using tweetnacl
      return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes())
    } catch (error) {
      this.logger.error('Error verifying Solana signature', { address, error })
      return false
    }
  }

  private isSolanaAddress(address: string): boolean {
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

    // Try to create a PublicKey to validate the address format
    try {
      new PublicKey(address)
      return true
    } catch {
      return false
    }
  }
}
