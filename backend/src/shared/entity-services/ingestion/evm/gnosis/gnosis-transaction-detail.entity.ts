import { Entity, Unique } from 'typeorm'
import { EvmTransactionDetail } from '../evm-transaction-detail.entity'

@Entity()
@Unique(`UQ_gnosis_transaction_detail_hash_blockchain`, [`hash`, `blockchainId`])
export class GnosisTransactionDetail extends EvmTransactionDetail {}
