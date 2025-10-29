import { Entity, Unique } from 'typeorm'
import { EvmTrace } from '../evm-trace.entity'

@Entity()
@Unique(`UQ_bsc_trace_transactionHash_blockchain_traceIndex`, [`transactionHash`, `blockchainId`, `traceIndex`])
export class BscTrace extends EvmTrace {}
