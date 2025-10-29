import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TripleATransfer } from './triple-a-transfer.entity'
import { TripleATransfersEntityService } from './triple-a-transfers.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([TripleATransfer])],
  providers: [TripleATransfersEntityService],
  exports: [TripleATransfersEntityService]
})
export class TripleATransfersEntityModule {}
