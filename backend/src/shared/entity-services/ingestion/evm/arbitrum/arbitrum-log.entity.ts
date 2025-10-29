import { Entity, Index, Unique } from 'typeorm'
import { EvmLog } from '../evm-log.entity'

@Entity()
@Unique('UQ_arbitrum_log_transaction_hash_blockchain_log_index', ['transactionHash', 'blockchainId', 'logIndex'])
@Index('IDX_arbitrum_log_hash_from', ['transactionHash', 'fromAddress'])
@Index('IDX_arbitrum_log_hash_to', ['transactionHash', 'toAddress'])
export class ArbitrumLog extends EvmLog {}
