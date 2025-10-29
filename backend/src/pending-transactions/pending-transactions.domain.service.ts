import { Injectable } from '@nestjs/common'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { ChartOfAccountsEntityService } from '../shared/entity-services/chart-of-accounts/chart-of-accounts.entity-service'
import { ContactDto } from '../shared/entity-services/contacts/contact'
import { ContactsEntityService } from '../shared/entity-services/contacts/contacts.entity-service'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { PendingTransactionsEntityService } from '../shared/entity-services/pending-transactions/pending-transactions.entity-service'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { PendingTransactionDto, PendingTransactionsQueryParams } from './interfaces'
import { FeatureFlagOption } from '../shared/entity-services/feature-flags/interfaces'
import { FeatureFlagsEntityService } from '../shared/entity-services/feature-flags/feature-flags.entity-service'
import { PendingTransactionType } from '../shared/entity-services/pending-transactions/interfaces'

@Injectable()
export class PendingTransactionsDomainService {
  constructor(
    private readonly contactsEntityService: ContactsEntityService,
    private readonly cryptocurrenciesEntityService: CryptocurrenciesEntityService,
    private readonly walletsEntityService: WalletsEntityService,
    private readonly pendingTransactionsEntityService: PendingTransactionsEntityService,
    private readonly chartOfAccountsEntityService: ChartOfAccountsEntityService,
    private readonly blockchainsEntityService: BlockchainsEntityService,
    private readonly featureFlagsEntityService: FeatureFlagsEntityService
  ) {}

  async getPendingTransactions(organizationId: string, query: PendingTransactionsQueryParams) {
    const wallets = query.walletIds
      ? await this.walletsEntityService.getAllGnosisByPublicIds(query.walletIds, organizationId)
      : await this.walletsEntityService.getAllGnosisByOrganizationId(organizationId)

    let types: PendingTransactionType[] | null = null
    const isReturnAllPendingTransactionsEnabled = await this.featureFlagsEntityService.isFeatureEnabled(
      FeatureFlagOption.RETURN_ALL_PENDING_TRANSACTIONS
    )
    if (!isReturnAllPendingTransactionsEnabled) {
      types = [
        PendingTransactionType.TOKEN_TRANSFER,
        PendingTransactionType.NATIVE_TRANSFER,
        PendingTransactionType.MULTI_SEND,
        PendingTransactionType.REJECTION
      ]
    }

    const pendingTransactions = await this.pendingTransactionsEntityService.getAllByOrganizationPaging(
      organizationId,
      wallets.map((wallet) => wallet.address),
      query,
      types
    )
    const contactsGrouped = await this.getGroupedContacts(organizationId)
    const cryptocurrenciesIds = pendingTransactions
      .map((item) => item.recipients.map((recipient) => recipient.cryptocurrencyId))
      .flat()
    const cryptoCurrencies = await this.cryptocurrenciesEntityService.getAllByIds(cryptocurrenciesIds)
    const chartOfAccounts = await this.chartOfAccountsEntityService.findByPublicIdsAndOrganization(
      pendingTransactions
        .flatMap((pendingTransaction) => pendingTransaction.recipients)
        .map((recipient) => recipient.chartOfAccountId)
        .filter((chartOfAccountId) => !!chartOfAccountId),
      organizationId
    )
    const enabledBlockchainIds = await this.blockchainsEntityService.getEnabledBlockchainPublicIds()

    return pendingTransactions.map((item) => {
      const wallet = wallets.find((wallet) => wallet.address === item.address)
      return PendingTransactionDto.map(
        item,
        wallet,
        contactsGrouped,
        cryptoCurrencies,
        enabledBlockchainIds,
        chartOfAccounts
      )
    })
  }

  async getGroupedContacts(organizationId: string): Promise<{ [address: string]: ContactDto }> {
    const contacts: ContactDto[] = await this.contactsEntityService.getByOrganizationIdAndNameOrAddress({
      organizationId
    })

    return this.contactsEntityService.groupContactDtosByAddress(contacts)
  }
}
