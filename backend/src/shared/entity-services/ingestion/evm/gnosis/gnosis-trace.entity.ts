import { Entity, Unique } from 'typeorm'
import { EvmTrace } from '../evm-trace.entity'

@Entity()
@Unique(`UQ_gnosis_trace_transactionHash_blockchain_traceIndex`, [`transactionHash`, `blockchainId`, `traceIndex`])
export class GnosisTrace extends EvmTrace {}
