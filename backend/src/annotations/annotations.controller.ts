import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Direction } from '../core/interfaces'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { AnnotationsEntityService } from '../shared/entity-services/annotations/annotations.entity-service'
import { AnnotationDto } from './interfaces'

@ApiTags('annotations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AnnotationsController {
  constructor(private annotationsEntityService: AnnotationsEntityService) {}

  @Get()
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: AnnotationDto, isArray: true })
  async getList(@OrganizationId() organizationId: string) {
    const annotations = await this.annotationsEntityService.getByOrganizationId(organizationId, { name: Direction.ASC })

    return annotations.map((annotation) => AnnotationDto.map(annotation))
  }
}
