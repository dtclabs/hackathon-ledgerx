import { Module } from '@nestjs/common'
import { IntegrationRetryRequestEntityService } from './integration-retry-request.entity.service'
import { IntegrationRetryRequest } from './integration-retry-request.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationRetryRequest])],
  providers: [IntegrationRetryRequestEntityService],
  exports: [TypeOrmModule, IntegrationRetryRequestEntityService]
})
export class IntegrationRetryRequestEntityModule {}
