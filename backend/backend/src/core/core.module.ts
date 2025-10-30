import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { LoggingInterceptor } from './interceptors/logging.interceptor'
import { TransformInterceptor } from './interceptors/transform.interceptor'
import { GetPrivateOrganizationIdInterceptor } from './interceptors/get-private-organization-id.interceptor'
import { OrganizationsEntityModule } from '../shared/entity-services/organizations/organizations.entity.module'
import { LoggerModule } from '../shared/logger/logger.module'

@Module({
  imports: [OrganizationsEntityModule, LoggerModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: GetPrivateOrganizationIdInterceptor }
  ]
})
export class CoreModule {}
