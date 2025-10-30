import { Entity, Unique } from 'typeorm'
import { EvmTrace } from '../evm-trace.entity'

@Entity()
@Unique(`UQ_polygon_trace_transactionHash_blockchain_traceIndex`, [`transactionHash`, `blockchainId`, `traceIndex`])
export class PolygonTrace extends EvmTrace {}
