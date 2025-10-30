import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { OrganizationsEntityService } from '../entity-services/organizations/organizations.entity-service'

@Injectable()
export class OrganizationOwnerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private organizationsService: OrganizationsEntityService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const wallet = request.user

    if (!request.params.organizationId) {
      return true
    }

    const organization = await this.organizationsService.findOne({
      where: { publicId: request.params.organizationId }
    })

    return organization ? true : false
  }
}
