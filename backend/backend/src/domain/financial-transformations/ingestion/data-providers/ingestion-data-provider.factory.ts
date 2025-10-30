import { Injectable } from '@nestjs/common'
import {
  isArbitrumBlockchain,
  isBscBlockchain,
  isEthereumBlockchain,
  isGnosisChainBlockchain,
  isOptimismBlockchain,
  isPolygonBlockchain
} from '../../../../shared/utils/utils'
import { ArbitrumDataProviderService } from './arbitrum-data-provider.service'
import { BscDataProviderService } from './bsc-data-provider.service'
import { EthereumDataProviderService } from './ethereum-data-provider.service'
import { EvmscanDataProviderBase } from './evmscan-data-provider.base'
import { EvmDataProviderService } from './interfaces'
import { PolygonDataProviderService } from './polygon-data-provider.service'
import { OptimismDataProviderService } from './optimism-data-provider.service'
import { GnosisDataProviderService } from './gnosis-data-provider.service'

@Injectable()
export class IngestionDataProviderFactory {
  constructor(
    private readonly ethereumDataProviderService: EthereumDataProviderService,
    private readonly polygonDataProviderService: PolygonDataProviderService,
    private readonly bscDataProviderService: BscDataProviderService,
    private readonly arbitrumDataProviderService: ArbitrumDataProviderService,
    private readonly optimismDataProviderService: OptimismDataProviderService,
    private readonly gnosisDataProviderService: GnosisDataProviderService
  ) {}

  getProvider(blockchainId: string): EvmDataProviderService | EvmscanDataProviderBase {
    if (isEthereumBlockchain(blockchainId)) {
      return this.ethereumDataProviderService
    } else if (isPolygonBlockchain(blockchainId)) {
      return this.polygonDataProviderService
    } else if (isBscBlockchain(blockchainId)) {
      return this.bscDataProviderService
    } else if (isArbitrumBlockchain(blockchainId)) {
      return this.arbitrumDataProviderService
    } else if (isOptimismBlockchain(blockchainId)) {
      return this.optimismDataProviderService
    } else if (isGnosisChainBlockchain(blockchainId)) {
      return this.gnosisDataProviderService
    } else {
      throw new Error(`No data provider for blockchain ${blockchainId}`)
    }
  }
}
