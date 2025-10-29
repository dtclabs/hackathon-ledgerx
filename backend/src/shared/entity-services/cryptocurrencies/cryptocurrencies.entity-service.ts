import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { lastValueFrom } from 'rxjs'
import { FindOptionsRelations, In, IsNull, Repository } from 'typeorm'
import { CoingeckoDomainService } from '../../../coingecko/coingecko.domain.service'
import { CoinInfoResponse } from '../../../coingecko/interface'
import { FilesService } from '../../../files/files.service'
import { BucketSelector } from '../../../files/interfaces'
import { LoggerService } from '../../logger/logger.service'
import { BaseEntityService } from '../base.entity-service'
import { FeatureFlagsEntityService } from '../feature-flags/feature-flags.entity-service'
import { CryptocurrencyAddress } from './cryptocurrency-address.entity'
import { Cryptocurrency } from './cryptocurrency.entity'
import { CryptocurrencyType } from './interfaces'

@Injectable()
export class CryptocurrenciesEntityService extends BaseEntityService<Cryptocurrency> {
  S3_BUCKET_PATH: string

  constructor(
    @InjectRepository(Cryptocurrency)
    private cryptocurrenciesRepository: Repository<Cryptocurrency>,
    @InjectRepository(CryptocurrencyAddress)
    private cryptocurrencyAddressesRepository: Repository<CryptocurrencyAddress>,
    private coingeckoDomainService: CoingeckoDomainService,
    private filesService: FilesService,
    private httpService: HttpService,
    private logger: LoggerService,
    private featureFlagsService: FeatureFlagsEntityService
  ) {
    super(cryptocurrenciesRepository)
    this.S3_BUCKET_PATH = 'cryptocurrency-images'
  }

  // Only works with coingecko for now
  async createNewErc20Token(address: string, blockchainId: string): Promise<Cryptocurrency> {
    return await this.createToken(address, blockchainId)
  }

  private async createToken(address: string, blockchainId: string) {
    const exist = await this.getByAddressAndBlockchain(address, blockchainId)

    if (exist) {
      return exist
    }

    const coinInfoAndDecimal: { coinInfoResponse: CoinInfoResponse; decimal: number } =
      await this.coingeckoDomainService.getCoinInfoFromContractAddressHistory({
        blockchainId,
        contractAddress: address
      })
    if (!coinInfoAndDecimal || !coinInfoAndDecimal.coinInfoResponse || !coinInfoAndDecimal.decimal) {
      //TODO: implement what we should do if coinGecko doesn't have the token. Where we should get name, symbol and etc
      return null
    }

    const { coinInfoResponse, decimal } = coinInfoAndDecimal

    // TODO: this should be done in transaction
    // TODO: we are relying on the fact that coingeckoId needs to be unique
    let cryptocurrency = await this.findOne({
      where: {
        coingeckoId: coinInfoResponse.id
      }
    })

    if (!cryptocurrency) {
      const cryptocurrencyToSave = Cryptocurrency.create({
        name: coinInfoResponse.name,
        symbol: coinInfoResponse.symbol.toUpperCase(),
        coingeckoId: coinInfoResponse.id,
        isVerified: false,
        image: null
      })

      cryptocurrency = await this.cryptocurrenciesRepository.save(cryptocurrencyToSave)
    }

    const cryptocurrencyAddressToSave = CryptocurrencyAddress.create({
      cryptocurrency: cryptocurrency,
      blockchainId: blockchainId,
      type: CryptocurrencyType.TOKEN,
      address: address.toLowerCase(),
      decimal
    })
    await this.upsertCryptocurrencyAddress(cryptocurrencyAddressToSave)

    //TODO: implement error logging correctly
    // Disabled automatic image refresh to avoid CoinGecko API calls
    // this.refreshImageForCryptocurrency(cryptocurrency.id, coinInfoResponse).catch()

    return this.getById(cryptocurrency.id)
  }

  async refreshImageForCryptocurrency(cryptocurrencyId: string, coinInfo?: CoinInfoResponse) {
    try {
      const cryptocurrency = await this.getById(cryptocurrencyId)

      if (!coinInfo) {
        coinInfo = await this.coingeckoDomainService.getCoinInfoFromCoinId(cryptocurrency.coingeckoId)
      }

      if (coinInfo) {
        try {
          for (const imageSize in coinInfo.image) {
            const path = `${this.S3_BUCKET_PATH}/${cryptocurrency.symbol}_${cryptocurrency.coingeckoId}_${cryptocurrency.publicId}_${imageSize}.png`

            const imageResponse = await lastValueFrom(
              this.httpService.get(coinInfo.image[imageSize], { responseType: 'stream' })
            )

            const streamReadPromise = new Promise<Buffer>((resolve) => {
              const chunks = []
              imageResponse.data.on('data', (chunk) => {
                chunks.push(Buffer.from(chunk))
              })
              imageResponse.data.on('end', () => {
                resolve(Buffer.concat(chunks))
              })
            })

            const imageData = await streamReadPromise

            const { filePath } = await this.filesService.uploadToS3(imageData, path, BucketSelector.PUBLIC)

            if (!cryptocurrency.image) {
              cryptocurrency.image = {}
            }
            cryptocurrency.image[imageSize] = filePath
          }
        } catch (e) {
          cryptocurrency.image = {}

          for (const imageSize in coinInfo.image) {
            const bucket = this.filesService.PUBLIC_AWS_S3_BUCKET
            const region = this.filesService.AWS_S3_REGION

            cryptocurrency.image[
              imageSize
            ] = `https://${bucket}.s3.${region}.amazonaws.com/cryptocurrency-images/missing_${imageSize}.png`
          }

          this.logger.warning(`Failed to refresh image for cryptocurrency ${cryptocurrencyId}`, e)
        }

        await this.cryptocurrenciesRepository.update(cryptocurrency.id, { image: cryptocurrency.image })
      }
    } catch (e) {
      this.logger.warning(`Failed to refresh image for cryptocurrency ${cryptocurrencyId}`, e)
    }
  }

  getById(id: string) {
    return this.findOne({
      where: {
        id: id
      },
      relations: ['addresses']
    })
  }

  getByPublicId(publicId: string) {
    return this.findOne({
      where: {
        publicId: publicId
      },
      relations: ['addresses']
    })
  }

  getByAddressAndBlockchain(address: string, blockchainId: string) {
    return this.findOne({
      where: {
        addresses: {
          address: address ? address.toLowerCase() : null,
          blockchainId: blockchainId
        }
      },
      relations: { addresses: true }
    })
  }

  getByAddressesAndBlockchain(address: string[], blockchainId: string) {
    const lowerCaseAddresses = address.map((a) => a.toLowerCase())
    return this.find({
      where: {
        addresses: {
          address: In(lowerCaseAddresses),
          blockchainId: blockchainId
        }
      },
      relations: { addresses: true }
    })
  }

  async getBySymbol(symbol: string) {
    return this.findOne({
      where: {
        symbol: symbol.toUpperCase()
      }
    })
  }

  async getBySymbols(symbols: string[]) {
    return this.find({
      where: {
        symbol: In(symbols.map((symbol) => symbol.toUpperCase()))
      }
    })
  }

  async getAddressesPerCryptocurrencySymbol(symbol: string) {
    return this.cryptocurrencyAddressesRepository.find({
      where: {
        cryptocurrency: {
          symbol: symbol.toUpperCase()
        }
      }
    })
  }

  async getCoinByBlockchain(blockchainId: string): Promise<Cryptocurrency> {
    return this.findOne({
      where: {
        addresses: {
          type: CryptocurrencyType.COIN,
          blockchainId: blockchainId
        }
      },
      relations: { addresses: true }
    })
  }

  getDecimalForCryptocurrency(cryptocurrency: Cryptocurrency, blockchainId: string): number {
    return cryptocurrency.addresses.find((adr) => adr.blockchainId === blockchainId).decimal
  }

  async getByAddressAndBlockchainAndSymbol(
    address: string,
    blockchainId: string,
    symbol: string
  ): Promise<Cryptocurrency> {
    const findOptionsWhere = {
      symbol: symbol,
      addresses: {
        blockchainId: blockchainId
      }
    }

    if (address) {
      findOptionsWhere.addresses['type'] = CryptocurrencyType.TOKEN
      findOptionsWhere.addresses['address'] = address.toLowerCase()
    } else {
      findOptionsWhere.addresses['type'] = CryptocurrencyType.COIN
    }

    return this.findOne({
      where: findOptionsWhere,
      relations: ['addresses']
    })
  }

  async getAllByAddresses(tokenAddresses: string[], blockchainId: string) {
    return this.find({
      where: [
        {
          addresses: {
            address: In(tokenAddresses),
            blockchainId: blockchainId
          }
        },
        {
          addresses: {
            address: IsNull(),
            blockchainId: blockchainId
          }
        }
      ],
      relations: { addresses: true }
    })
  }

  getAllByPublicIds(publicIds: string[], relations?: FindOptionsRelations<Cryptocurrency>) {
    return this.find({
      where: {
        publicId: In(publicIds)
      },
      relations
    })
  }

  getAllByIds(cryptoCurrenciesIds: string[], relations?: FindOptionsRelations<Cryptocurrency>) {
    return this.find({
      where: {
        id: In(cryptoCurrenciesIds)
      },
      relations
    })
  }

  async upsertCryptocurrencyAddress(cryptocurrencyAddress: CryptocurrencyAddress) {
    await this.cryptocurrencyAddressesRepository.upsert(cryptocurrencyAddress, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['address', 'type', 'blockchainId']
    })
  }

  async createSolanaToken(params: {
    symbol: string
    name: string
    address?: string
    blockchainId: string
  }): Promise<Cryptocurrency> {
    // Create cryptocurrency without coingeckoId for Solana tokens
    const cryptocurrency = new Cryptocurrency()
    cryptocurrency.name = params.name
    cryptocurrency.symbol = params.symbol.toUpperCase()
    cryptocurrency.coingeckoId = `solana-${params.symbol.toLowerCase()}` // Use a default pattern
    cryptocurrency.isVerified = false
    cryptocurrency.image = null

    const savedCryptocurrency = await this.cryptocurrenciesRepository.save(cryptocurrency)

    // Create cryptocurrency address if address is provided
    if (params.address) {
      const cryptocurrencyAddress = CryptocurrencyAddress.create({
        cryptocurrency: savedCryptocurrency,
        blockchainId: params.blockchainId,
        decimal: 9, // Default Solana decimals
        type: CryptocurrencyType.TOKEN,
        address: params.address
      })

      await this.cryptocurrencyAddressesRepository.save(cryptocurrencyAddress)
    }

    return this.getById(savedCryptocurrency.id)
  }

  async getAllSolanaTokens(blockchainIds: string[] = []): Promise<Cryptocurrency[]> {
    const query = this.cryptocurrenciesRepository
      .createQueryBuilder('cryptocurrency')
      .leftJoinAndSelect('cryptocurrency.addresses', 'address')
      .where('1=1') // Base condition

    if (blockchainIds.length > 0) {
      // Filter by specific Solana blockchain IDs
      query.andWhere('address.blockchainId IN (:...blockchainIds)', { blockchainIds })
    } else {
      // Get all Solana tokens (including native SOL)
      query.andWhere('(address.blockchainId LIKE :solana OR cryptocurrency.symbol = :sol)', {
        solana: '%solana%',
        sol: 'SOL'
      })
    }

    query.orderBy('cryptocurrency.symbol', 'ASC')

    return query.getMany()
  }

  /**
   * Get all cryptocurrencies that are missing images
   */
  async getAllMissingImages(): Promise<Cryptocurrency[]> {
    return this.cryptocurrenciesRepository.find({
      where: [
        { image: IsNull() },
        { image: {} as any }
      ],
      order: {
        symbol: 'ASC'
      }
    })
  }

  /**
   * Update multiple cryptocurrencies with new image data
   */
  async updateImages(updates: Array<{ id: string; image: any }>): Promise<void> {
    for (const update of updates) {
      await this.cryptocurrenciesRepository.update(update.id, {
        image: update.image,
        updatedAt: new Date()
      })
    }
  }
}
