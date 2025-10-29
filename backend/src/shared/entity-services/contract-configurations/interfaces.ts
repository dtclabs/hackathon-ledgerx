import { AbiInput } from 'web3-utils'

export enum ContractConfigurationPlaceholderEnum {
  ADDRESS_IN = 'address_in',
  ADDRESS_OUT = 'address_out'
}

export interface ContractConfigurationMetadata {
  parameterName: string
  abi: AbiFunction[]
}

export interface AbiFunction extends AbiInput {
  name: string
  type: string
  indexed?: boolean
  components?: AbiInput[]
  internalType?: string
}
