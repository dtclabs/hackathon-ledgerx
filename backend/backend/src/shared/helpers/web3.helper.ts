const Web3EthAbi = require('web3-eth-abi')

export const web3Helper = {
  fromDecodedAddress
}

function fromDecodedAddress(value: string): string {
  const address = Web3EthAbi.decodeParameter('address', value) as string
  return address?.toString()?.toLowerCase() ?? null
}
