import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LoggerService } from '../../shared/logger/logger.service'
import {
  isArbitrumBlockchain,
  isBscBlockchain,
  isEthereumBlockchain,
  isGnosisChainBlockchain,
  isOptimismBlockchain,
  isPolygonBlockchain,
  isSolanaBlockchain
} from '../../shared/utils/utils'
import { AlchemyAdapter } from './alchemy/alchemy.adapter'
import { BlockExplorersProviderEnum } from './block-explorers-provider.enum'
import { EtherscanAdapter } from './etherscan/etherscan.adapter'
import { SolanaAdapter } from './solana/solana.adapter'
import { FeatureMapType } from './types/feature-key.type'

@Injectable()
export class BlockExplorerAdapterFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: LoggerService
  ) {}

  getBlockExplorerAdapter(blockExplorer: BlockExplorersProviderEnum, blockchainId: string): AlchemyAdapter | SolanaAdapter {
    switch (blockExplorer) {
      case BlockExplorersProviderEnum.ETHERSCAN:
        throw new Error(`Not implemented yet`)
      case BlockExplorersProviderEnum.ALCHEMY:
        return this.getAlchemyAdapter(blockchainId)
      case BlockExplorersProviderEnum.SOLANA_RPC:
        return this.getSolanaAdapter(blockchainId)
      default:
        throw new Error(`BlockExplorerAdapter not found for ${blockExplorer}`)
    }
  }

  getEtherscanAdapter(blockchainId: string): EtherscanAdapter {
    let apiKey: string = null
    let requestPerSecond: number
    if (isEthereumBlockchain(blockchainId)) {
      apiKey = this.configService.get('ETHERSCAN_API_KEY')
      requestPerSecond = this.configService.get('ETHERSCAN_REQUEST_PER_SECOND')
    } else if (isPolygonBlockchain(blockchainId)) {
      apiKey = this.configService.get('POLYGONSCAN_API_KEY')
      requestPerSecond = this.configService.get('POLYGONSCAN_REQUEST_PER_SECOND')
    } else if (isBscBlockchain(blockchainId)) {
      apiKey = this.configService.get('BSCSCAN_API_KEY')
      requestPerSecond = this.configService.get('BSCSCAN_REQUEST_PER_SECOND')
    } else if (isArbitrumBlockchain(blockchainId)) {
      apiKey = this.configService.get('ARBISCAN_API_KEY')
      requestPerSecond = this.configService.get('ARBISCAN_REQUEST_PER_SECOND')
    } else if (isOptimismBlockchain(blockchainId)) {
      apiKey = this.configService.get('OPTIMISTIC_ETHERSCAN_API_KEY')
      requestPerSecond = this.configService.get('OPTIMISTIC_ETHERSCAN_REQUEST_PER_SECOND')
    } else if (isGnosisChainBlockchain(blockchainId)) {
      apiKey = this.configService.get('GNOSISSCAN_API_KEY')
      requestPerSecond = this.configService.get('GNOSISSCAN_REQUEST_PER_SECOND')
    } else {
      throw new Error(`No API key found for blockchain ${blockchainId}`)
    }

    if (!requestPerSecond) {
      requestPerSecond = 5 // default to etherscan free tier rate limit if not defined. https://etherscan.io/apis.
    }
    return new EtherscanAdapter(apiKey, this.httpService, blockchainId, requestPerSecond)
  }

  getAlchemyAdapter(blockchainId: string): AlchemyAdapter {
    const keys: FeatureMapType = {
      INGESTION: this.configService.get('ALCHEMY_INGESTION_API_KEY')
    }
    return new AlchemyAdapter(keys, this.httpService, blockchainId, this.logger)
  }

  getSolanaAdapter(blockchainId: string): SolanaAdapter {
    if (!isSolanaBlockchain(blockchainId)) {
      throw new Error(`Invalid Solana blockchain: ${blockchainId}`)
    }
    return new SolanaAdapter(this.httpService, this.configService)
  }
}
