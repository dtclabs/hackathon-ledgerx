import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganizationIntegrationAuth } from './organization-integration-auth.entity'
import { OrganizationIntegration } from './organization-integration.entity'
import { OrganizationIntegrationsEntityService } from './organization-integrations.entity-service'
import { DtcpayModule } from '../../../domain/integrations/dtcpay/dtcpay.module'

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationIntegration, OrganizationIntegrationAuth]), DtcpayModule],
  providers: [OrganizationIntegrationsEntityService],
  exports: [TypeOrmModule, OrganizationIntegrationsEntityService]
})
export class OrganizationIntegrationsEntityModule {}
