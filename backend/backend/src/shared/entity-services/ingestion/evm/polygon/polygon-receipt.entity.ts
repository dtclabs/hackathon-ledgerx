import { Entity, Unique } from 'typeorm'
import { EvmReceipt } from '../evm-receipt.entity'

@Entity()
@Unique(`UQ_polygon_receipt_transaction_hash_blockchain`, [`transactionHash`, `blockchainId`])
export class PolygonReceipt extends EvmReceipt {}
