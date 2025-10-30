import { Entity, Unique } from 'typeorm'
import { EvmTransactionDetail } from '../evm-transaction-detail.entity'

@Entity()
@Unique(`UQ_polygon_transaction_detail_hash_blockchain`, [`hash`, `blockchainId`])
export class PolygonTransactionDetail extends EvmTransactionDetail {}
