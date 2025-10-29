import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Payment } from './payment.entity'
import { PaymentsEntityService } from './payments.entity-service'
import { FilesModule } from '../../../files/files.module'

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), FilesModule],
  controllers: [],
  providers: [PaymentsEntityService],
  exports: [PaymentsEntityService]
})
export class PaymentsEntityModule {}
