import { isHexStrict } from 'web3-utils'
import { Blockchain } from '../entity-services/blockchains/blockchain.entity'
import { SupportedBlockchains } from '../entity-services/blockchains/interfaces'

export const sortByName = (list: any[]) =>
  list.sort((a, b) => (!a.name || !b.name || a.name < b.name ? -1 : a.name > b.name ? 1 : 0))

//TODO: These should not be here. Should be in blockchain service
export function isEthereumBlockchain(blockchainId: string) {
  return (
    blockchainId === SupportedBlockchains.ETHEREUM_MAINNET ||
    blockchainId === SupportedBlockchains.GOERLI ||
    blockchainId === SupportedBlockchains.SEPOLIA
  )
}

export function isPolygonBlockchain(blockchainId: string) {
  return blockchainId === SupportedBlockchains.POLYGON_MAINNET
}

export function isBscBlockchain(blockchainId: string) {
  return blockchainId === SupportedBlockchains.BSC_MAINNET
}

export function isArbitrumBlockchain(blockchainId: string) {
  return blockchainId === SupportedBlockchains.ARBITRUM_ONE
}

export function isOptimismBlockchain(blockchainId: string) {
  return blockchainId === SupportedBlockchains.OPTIMISM
}

export function isGnosisChainBlockchain(blockchainId: string) {
  return blockchainId === SupportedBlockchains.GNOSIS_CHAIN
}

export function isSolanaBlockchain(blockchainId: string) {
  return blockchainId === SupportedBlockchains.SOLANA_MAINNET || blockchainId === SupportedBlockchains.SOLANA_DEVNET
}

export function getBlockExplorerUrlToAddress(blockchain: Blockchain, address: string) {
  if (!blockchain) {
    return ''
  }
  return `${blockchain.blockExplorer}address/${address}`
}

export function getBlockExplorerUrlToTransaction(blockchain: Blockchain, txHash: string) {
  if (!blockchain) {
    return ''
  }
  if (isHexStrict(txHash)) {
    return `${blockchain.blockExplorer}tx/${txHash}`
  } else {
    // temp fix if txHash is a block number. for Block reward txs
    return `${blockchain.blockExplorer}block/${txHash}`
  }
}

export function withTimeout<T>(func: () => Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutHandle: NodeJS.Timeout

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`Function timed out after ${timeoutMs} ms`))
    }, timeoutMs)
  })

  return Promise.race([func(), timeoutPromise])
    .then((result) => {
      clearTimeout(timeoutHandle)
      return result
    })
    .catch((error) => {
      clearTimeout(timeoutHandle)
      throw error
    })
}
