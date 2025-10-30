import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { IsEthereumOrSolanaAddress } from '../shared/validators/address.validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { SupportedBlockchains } from '../shared/entity-services/blockchains/interfaces'
import { CryptocurrencyResponseDto } from '../cryptocurrencies/interfaces'
import { ContactDto } from '../shared/entity-services/contacts/contact'
import { toChecksumAddress } from 'web3-utils'
import {
  PendingTransaction,
  TransactionRecipient
} from '../shared/entity-services/pending-transactions/pending-transaction.entity'
import { Cryptocurrency } from '../shared/entity-services/cryptocurrencies/cryptocurrency.entity'
import { Wallet } from '../shared/entity-services/wallets/wallet.entity'
import { WalletDto } from '../wallets/interfaces'
import { GnosisMultisigTransaction } from '../domain/block-explorers/gnosis/interfaces'
import { ChartOfAccount } from '../shared/entity-services/chart-of-accounts/chart-of-account.entity'
import { ChartOfAccountDto } from '../chart-of-accounts/inferfaces'
import { GnosisMultisigConfirmationDto } from '../financial-transactions/interfaces'
import { ToArray } from '../shared/decorators/transformers/transformers'
import { PendingTransactionType } from '../shared/entity-services/pending-transactions/interfaces'

export class PendingTransactionsQueryParams {
  @IsOptional()
  @ToArray()
  @IsString({ each: true })
  @IsEnum(SupportedBlockchains, { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: [SupportedBlockchains.ETHEREUM_MAINNET],
    description: 'Get enum from the publicId of blockchains endpoint'
  })
  blockchainIds: string[]

  @IsOptional()
  @ToArray()
  @IsUUID('all', { each: true })
  @ApiPropertyOptional({
    isArray: true,
    example: ['651360da-dd94-4e92-a7fb-e3f963a03895'],
    description: 'Public IDs of wallets to retrieve pending transactions for'
  })
  walletIds: string[]
}

export class PendingTransactionRecipientDto {
  @ApiProperty({ example: '0x3fE465eDc3A17D1e37c2763Ad9A21526Ce09c2B0' })
  @IsNotEmpty()
  @IsString()
  @IsEthereumOrSolanaAddress({ message: 'address must be a valid Ethereum or Solana address' })
  address: string

  @ApiProperty({ nullable: true })
  contact: ContactDto

  @IsNotEmpty()
  @ApiProperty({ example: '0.004473765531106052' })
  cryptocurrencyAmount: string

  @ApiProperty({ nullable: true })
  fiatAmount: string

  @ApiProperty({ nullable: true })
  fiatAmountPerUnit: string

  @ApiProperty({ nullable: true })
  fiatCurrency: string

  @IsNotEmpty()
  @ApiProperty({ type: CryptocurrencyResponseDto })
  cryptocurrency: CryptocurrencyResponseDto

  @ApiProperty({ nullable: true })
  chartOfAccount: ChartOfAccountDto

  @ApiProperty({ nullable: true })
  notes: string

  @ApiProperty({ nullable: true })
  files: { filename: string; path: string }[]

  static map(
    pendingTransactionRecipient: TransactionRecipient,
    contacts: { [address: string]: ContactDto },
    cryptocurrencies: Cryptocurrency[],
    chartOfAccount: ChartOfAccount
  ): PendingTransactionRecipientDto {
    const result = new PendingTransactionRecipientDto()
    result.address = toChecksumAddress(pendingTransactionRecipient.address)
    result.contact = contacts[pendingTransactionRecipient.address.toLowerCase()] ?? null
    result.cryptocurrencyAmount = pendingTransactionRecipient.amount
    result.fiatAmount = pendingTransactionRecipient.fiatAmount
    result.fiatAmountPerUnit = pendingTransactionRecipient.fiatAmountPerUnit
    result.fiatCurrency = pendingTransactionRecipient.fiatCurrency
    const cryptocurrency = cryptocurrencies.find((c) => c.id === pendingTransactionRecipient.cryptocurrencyId)
    result.cryptocurrency = CryptocurrencyResponseDto.map(cryptocurrency)
    if (chartOfAccount) result.chartOfAccount = ChartOfAccountDto.map(chartOfAccount)
    result.notes = pendingTransactionRecipient.notes
    result.files = pendingTransactionRecipient.files
    return result
  }
}

export class PendingTransactionDto {
  @ApiProperty({ example: 'f290353a-9607-4c90-9aef-78b1330a98a5' })
  @IsNotEmpty()
  id: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '0xa9cfbdeb84d02dbbad3ae6b1d063c5ad85e88e4fa307f4e112f00ff89a9cfac3' })
  safeHash: string

  @IsNotEmpty()
  @IsEnum(SupportedBlockchains)
  @ApiProperty({
    example: SupportedBlockchains.ETHEREUM_MAINNET,
    description: 'Get enum from the publicId of blockchains endpoint'
  })
  blockchainId: string

  @ApiProperty()
  wallet: WalletDto

  @ApiProperty({ type: PendingTransactionRecipientDto, isArray: true })
  recipients: PendingTransactionRecipientDto[]

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({ example: '2023-02-28T07:58:47.000Z' })
  submissionDate: Date

  @ApiProperty({ example: 1 })
  nonce: number

  @ApiProperty({ example: 2 })
  confirmationsRequired: number
  @ApiProperty({ isArray: true, type: GnosisMultisigConfirmationDto })
  confirmations: GnosisMultisigConfirmationDto[]

  @ApiProperty({ description: 'Gnosis Multisig Transaction' })
  safeTransaction: GnosisMultisigTransaction

  @IsString()
  @ApiProperty({ example: 'Sample notes' })
  notes: string

  @ApiProperty({ example: PendingTransactionType.TOKEN_TRANSFER })
  @IsEnum(PendingTransactionType)
  type: PendingTransactionType

  @ApiProperty()
  error: string

  static map(
    pendingTransaction: PendingTransaction,
    wallet: Wallet,
    contacts: { [address: string]: ContactDto },
    cryptocurrencies: Cryptocurrency[],
    enabledBlockchainIds: string[],
    chartOfAccounts: ChartOfAccount[]
  ): PendingTransactionDto {
    const result = new PendingTransactionDto()
    result.id = pendingTransaction.publicId
    result.safeHash = pendingTransaction.safeHash
    result.blockchainId = pendingTransaction.blockchainId
    result.recipients = pendingTransaction.recipients.map((recipient) => {
      return PendingTransactionRecipientDto.map(
        recipient,
        contacts,
        cryptocurrencies,
        chartOfAccounts.find((chartOfAccount) => chartOfAccount.publicId === recipient.chartOfAccountId)
      )
    })
    result.submissionDate = pendingTransaction.submissionDate
    result.nonce = pendingTransaction.nonce
    result.wallet = WalletDto.map({ wallet, enabledBlockchainIds })
    result.confirmationsRequired = pendingTransaction.confirmationsRequired
    result.confirmations = pendingTransaction.confirmations.map((confirmation) =>
      GnosisMultisigConfirmationDto.map(confirmation, contacts)
    )
    result.safeTransaction = pendingTransaction.safeTransaction
    result.notes = pendingTransaction.notes
    result.type = pendingTransaction.type
    result.error = pendingTransaction.error
    return result
  }
}
