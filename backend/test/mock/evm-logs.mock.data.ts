import { EtherscanLog } from '../../src/domain/block-explorers/etherscan/interfaces'
import { numberToHex } from 'web3-utils'

export function getLogs(amount: number = 100): EtherscanLog[] {
  const logs: EtherscanLog[] = []
  for (let i = 0; i < amount; i++) {
    logs.push(getLog({ blockNumber: i }))
  }
  return logs
}

function getLog(params: { blockNumber: number }): EtherscanLog {
  return {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    topics: [
      '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
      '0x00000000000000000000000077016474b3fff23611cb827efbadaea44f10637c'
    ],
    data: '0x00000000000000000000000000000000000000000000000005698eef06670000',
    blockNumber: numberToHex(params.blockNumber),
    blockHash: '0x647ef83ab4cc752d1bdb166c04fedac4632f10b18d9256d0f2545296de9bde1b',
    timeStamp: '0x6131ec43',
    gasPrice: '0x1c4d2993a5',
    gasUsed: '0x76c4',
    logIndex: '0x18a',
    transactionHash: '0xcef444892bfe0bcebdb0c8e704b002d44bb1bad47b62666d7ece7037e870a4a4',
    transactionIndex: '0xe4'
  }
}
