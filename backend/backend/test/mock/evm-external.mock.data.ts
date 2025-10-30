import { EtherscanExternalTransaction } from '../../src/domain/block-explorers/etherscan/interfaces'

export function getExternals(amount: number = 100): EtherscanExternalTransaction[] {
  const logs: EtherscanExternalTransaction[] = []
  for (let i = 0; i < amount; i++) {
    logs.push(getExternal({ blockNumber: i }))
  }
  return logs
}

function getExternal(params: { blockNumber: number }): EtherscanExternalTransaction {
  return {
    blockNumber: params.blockNumber.toString(),
    timeStamp: '1687951883',
    hash: '0xe69f0bdc151b884081c52796bb459edcd2487c73ae54e6e00e2c776427b462a6',
    nonce: '817',
    blockHash: '0x0fe37464c162d91fdafa82f5c4dd7e8d9b00ed009de66f376d600069ca353a56',
    transactionIndex: '141',
    from: '0x77016474b3fff23611cb827efbadaea44f10637c',
    to: '0xd152f549545093347a162dce210e7293f1452150',
    value: '0',
    gas: '89268',
    gasPrice: '18916808975',
    isError: '0',
    txreceipt_status: '1',
    input:
      '0xc73a2d600000000000000000000000003845badade8e6dff049820680d1f14bd3903a5d0000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000b0c25128707833eaf7b51707d5f2bc31e16fbdd400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a7640000',
    contractAddress: '',
    cumulativeGasUsed: '11300715',
    gasUsed: '71274',
    confirmations: '545384',
    methodId: '0xc73a2d60',
    functionName: 'disperseToken(address token, address[] recipients, uint256[] values)'
  }
}
