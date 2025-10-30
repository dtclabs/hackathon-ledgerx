import { Injectable } from '@nestjs/common'
import {
  isArbitrumBlockchain,
  isBscBlockchain,
  isEthereumBlockchain,
  isGnosisChainBlockchain,
  isOptimismBlockchain,
  isPolygonBlockchain
} from '../../../shared/utils/utils'
import { ArbitrumStrategy } from './strategies/arbitrum.strategy'
import { BscStrategy } from './strategies/bsc.strategy'
import { EthMainnetStrategy } from './strategies/eth-mainnet.strategy'
import { PreprocessStrategy } from './strategies/interfaces'
import { PolygonStrategy } from './strategies/polygon.strategy'
import { OptimismStrategy } from './strategies/optimism.strategy'
import { GnosisStrategy } from './strategies/gnosis.strategy'

@Injectable()
export class PreprocessStrategyFactory {
  constructor(
    private ethMainnetStrategy: EthMainnetStrategy,
    private polygonStrategy: PolygonStrategy,
    private bscStrategy: BscStrategy,
    private arbitrumStrategy: ArbitrumStrategy,
    private optimismStrategy: OptimismStrategy,
    private gnosisStrategy: GnosisStrategy
  ) {}

  getStrategy(blockchainId: string): PreprocessStrategy {
    if (isEthereumBlockchain(blockchainId)) {
      return this.ethMainnetStrategy
    } else if (isPolygonBlockchain(blockchainId)) {
      return this.polygonStrategy
    } else if (isBscBlockchain(blockchainId)) {
      return this.bscStrategy
    } else if (isArbitrumBlockchain(blockchainId)) {
      return this.arbitrumStrategy
    } else if (isOptimismBlockchain(blockchainId)) {
      return this.optimismStrategy
    } else if (isGnosisChainBlockchain(blockchainId)) {
      return this.gnosisStrategy
    } else {
      throw new Error(`Blockchain ${blockchainId} is not supported`)
    }
  }
}
