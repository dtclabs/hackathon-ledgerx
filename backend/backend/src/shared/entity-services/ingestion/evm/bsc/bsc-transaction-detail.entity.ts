import { Entity, Unique } from 'typeorm'
import { EvmTransactionDetail } from '../evm-transaction-detail.entity'

@Entity()
@Unique(`UQ_bsc_transaction_detail_hash_blockchain`, [`hash`, `blockchainId`])
export class BscTransactionDetail extends EvmTransactionDetail {}
