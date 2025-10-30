import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from '@nestjs/common'
import { OrganizationsEntityService } from '../../shared/entity-services/organizations/organizations.entity-service'
import { ORGANIZATION_ID } from '../../shared/decorators/organization-id/organization-id.decorator'

export const PUBLIC_ORGANIZATION_ID_PARAM = 'organizationId'

@Injectable()
export class GetPrivateOrganizationIdInterceptor implements NestInterceptor {
  constructor(private readonly organizationsService: OrganizationsEntityService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const req = context.switchToHttp().getRequest()
    const publicOrganizationId = req.params[PUBLIC_ORGANIZATION_ID_PARAM]

    if (publicOrganizationId) {
      const organization = await this.organizationsService.findByPublicId(publicOrganizationId)
      if (organization) {
        req[ORGANIZATION_ID] = organization.id
      } else {
        throw new NotFoundException(`Organization not found`)
      }
    }
    return next.handle()
  }
}
