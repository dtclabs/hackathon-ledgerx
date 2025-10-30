import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Integration } from './integration.entity'
import { IntegrationEntityService } from './integration.entity-service'

@Module({
  imports: [TypeOrmModule.forFeature([Integration])],
  providers: [IntegrationEntityService],
  exports: [TypeOrmModule, IntegrationEntityService]
})
export class IntegrationEntityModule {}
