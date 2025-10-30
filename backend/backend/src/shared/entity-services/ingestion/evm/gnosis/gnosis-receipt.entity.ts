import { Entity, Unique } from 'typeorm'
import { EvmReceipt } from '../evm-receipt.entity'

@Entity()
@Unique(`UQ_gnosis_receipt_transaction_hash_blockchain`, [`transactionHash`, `blockchainId`])
export class GnosisReceipt extends EvmReceipt {}
