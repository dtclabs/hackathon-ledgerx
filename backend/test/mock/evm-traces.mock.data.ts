import { EtherscanInternalTransaction } from '../../src/domain/block-explorers/etherscan/interfaces'

export function getTraces(amount: number = 100): EtherscanInternalTransaction[] {
  const logs: EtherscanInternalTransaction[] = []
  for (let i = 0; i < amount; i++) {
    logs.push(getTrace({ blockNumber: i }))
  }
  return logs
}

function getTrace(params: { blockNumber: number }): EtherscanInternalTransaction {
  return {
    blockNumber: params.blockNumber.toString(),
    timeStamp: '1683697319',
    hash: '0x722f1272eb2ca1b4d26fd524db64256bfee9049da9230f293c6046eddbbe128a',
    from: '0xb8901acb165ed027e32754e0ffe830802919727f',
    to: '0x77016474b3fff23611cb827efbadaea44f10637c',
    value: '698204596170511790',
    contractAddress: '',
    input: '',
    type: 'call',
    gas: '401918',
    gasUsed: '0',
    isError: '0',
    errCode: ''
  }
}
