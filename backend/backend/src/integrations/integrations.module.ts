import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { IntegrationEntityModule } from '../shared/entity-services/integration/integration.entity.module';
import { IntegrationEntityService } from '../shared/entity-services/integration/integration.entity-service';

@Module({
  imports:[IntegrationEntityModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService,IntegrationEntityService]
})
export class IntegrationsModule {}
