import { BadRequestException, Injectable } from '@nestjs/common'
import { CryptocurrenciesEntityService } from '../shared/entity-services/cryptocurrencies/cryptocurrencies.entity-service'
import { WalletsEntityService } from '../shared/entity-services/wallets/wallets.entity-service'
import { CryptocurrencyResponseDto } from './interfaces'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'

@Injectable()
export class CryptocurrenciesDomainService {
  constructor(
    private cryptocurrenciesService: CryptocurrenciesEntityService,
    private walletsService: WalletsEntityService,
    private blockchainsEntityService: BlockchainsEntityService
  ) {}

  async getByOrganizationAndWalletPublicIds(
    organizationId: string,
    walletPublicIds: string[],
    blockchainIds: string[]
  ) {
    let supportedBlockchains: string[] = []
    if (blockchainIds) {
      // Filter provided blockchainIds to only include Solana blockchains
      supportedBlockchains = blockchainIds.filter(id => id.includes('solana'))
    } else {
      // Get only Solana blockchain IDs
      supportedBlockchains = await this.blockchainsEntityService.getSolanaBlockchainPublicIds()
    }
    const cryptocurrencyDtos: CryptocurrencyResponseDto[] = []

    const wallets = await this.getWalletIdsFromPublicId(organizationId, walletPublicIds)

    const cryptocurrencyIdSet = new Set<string>()

    for (const blockchainId of supportedBlockchains) {
      for (const wallet of wallets) {
        if (wallet.balance?.blockchains && wallet.balance?.blockchains[blockchainId]) {
          const cryptocurrencyList = wallet.balance.blockchains[blockchainId]
          cryptocurrencyList.forEach((c) => cryptocurrencyIdSet.add(c.cryptocurrency.publicId))
        }
      }
    }

    const cryptocurrencyIds = Array.from(cryptocurrencyIdSet)
    const cryptocurrencies = await this.cryptocurrenciesService.getAllByPublicIds(cryptocurrencyIds, {
      addresses: true
    })

    cryptocurrencyDtos.push(...cryptocurrencies.map((c) => CryptocurrencyResponseDto.map(c)))

    return cryptocurrencyDtos
  }

  async getAllSolanaTokens(blockchainIds?: string[]): Promise<CryptocurrencyResponseDto[]> {
    // Get only Solana blockchain IDs if none provided
    let solanaBlockchainIds: string[] = []
    if (blockchainIds) {
      solanaBlockchainIds = blockchainIds.filter(id => id.includes('solana'))
    } else {
      solanaBlockchainIds = await this.blockchainsEntityService.getSolanaBlockchainPublicIds()
    }

    // Get all Solana cryptocurrencies from database
    const solanaCryptocurrencies = await this.cryptocurrenciesService.getAllSolanaTokens(solanaBlockchainIds)

    return solanaCryptocurrencies.map(crypto => CryptocurrencyResponseDto.map(crypto))
  }

  async getWalletIdsFromPublicId(organizationId: string, walletPublicIds: string[]) {
    let wallets = await this.walletsService.getAllByOrganizationId(organizationId)

    if (walletPublicIds?.length) {
      const walletsTemp = wallets
      wallets = []

      for (const walletPublicId of walletPublicIds) {
        const wallet = walletsTemp.find((orgWalletId) => orgWalletId.publicId === walletPublicId)

        if (!wallet) {
          throw new BadRequestException('Please make sure you are specifying the correct walletIds')
        }

        wallets.push(wallet)
      }
    }

    return wallets
  }
}
