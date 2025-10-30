import { Entity, Index, Unique } from 'typeorm'
import { EvmAddressTransaction } from '../evm-address-transaction.entity'

@Entity()
@Unique('UQ_arbitrum_address_transaction_hash_blockchain_address_config', [
  'hash',
  'blockchainId',
  'address',
  'contractConfigurationId'
])
@Index('IDX_arbitrum_address_transaction_address_blockchain_status', ['address', 'blockchainId', 'status'], {
  where: 'deleted_at IS NULL'
})
export class ArbitrumAddressTransaction extends EvmAddressTransaction {}
