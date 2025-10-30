import { Injectable } from '@nestjs/common'
import Decimal from 'decimal.js'
import { hexToNumberString } from 'web3-utils'
import { CreateEvmPreprocessDtoParams } from '../strategies/interfaces'
import { CreateFeePreprocessDtoCommand } from './create-fee-preprocess-dto.command'
import { OptimismReceipt } from '../../../../shared/entity-services/ingestion/evm/optimism/optimism-receipt.entity'

@Injectable()
export class OptimismCreateFeePreprocessDtoCommand extends CreateFeePreprocessDtoCommand {
  constructor() {
    super()
  }

  calculateFee(params: CreateEvmPreprocessDtoParams) {
    const l2Fee = super.calculateFee(params)

    const optimismReceipt = params.receipt as OptimismReceipt

    if (optimismReceipt.l1Fee) {
      // see https://optimistic.etherscan.io/tx/0x68a70b7f94dea754d679fb8f421928fdb6263f51fcc831dbf9946a7b3bf73cd0
      // l1Fee is null, tx fee is 0
      const l1Fee = new Decimal(hexToNumberString(optimismReceipt.l1Fee))
      return l2Fee.add(l1Fee)
    }
    return l2Fee
  }
}
