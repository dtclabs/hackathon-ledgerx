import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Invoice } from './invoice.entity'
import { InvoicesEntityService } from './invoices.entity-service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [TypeOrmModule.forFeature([Invoice]), ConfigModule],
  providers: [InvoicesEntityService],
  exports: [TypeOrmModule, InvoicesEntityService]
})
export class InvoicesEntityModule {}
