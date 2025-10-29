import { Column, DeepPartial, Entity, Unique } from 'typeorm'
import { EvmReceipt } from '../evm-receipt.entity'
import { OptimismEvmReceiptCreateParams } from '../interfaces'

@Entity()
@Unique(`UQ_optimism_receipt_transaction_hash_blockchain`, [`transactionHash`, `blockchainId`])
export class OptimismReceipt extends EvmReceipt {
  @Column({ name: 'l1_fee', nullable: true })
  l1Fee: string
  @Column({ name: 'l1_fee_scalar', nullable: true })
  l1FeeScalar: string
  @Column({ name: 'l1_gas_price', nullable: true })
  l1GasPrice: string
  @Column({ name: 'l1_gas_used', nullable: true })
  l1GasUsed: string

  static create<T extends OptimismReceipt>(params: OptimismEvmReceiptCreateParams): DeepPartial<OptimismReceipt> {
    return {
      ...EvmReceipt.create(params),
      l1Fee: params.l1Fee,
      l1FeeScalar: params.l1FeeScalar,
      l1GasPrice: params.l1GasPrice,
      l1GasUsed: params.l1GasUsed
    }
  }
}
