import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Direction } from '../core/interfaces'
import { AccountId } from '../shared/decorators/accountId/account-id.decorator'
import { OrganizationId } from '../shared/decorators/organization-id/organization-id.decorator'
import { AnnotationsEntityService } from '../shared/entity-services/annotations/annotations.entity-service'
import { AnnotationType } from '../shared/entity-services/annotations/interfaces'
import { FinancialTransactionChildAnnotationEntityService } from '../shared/entity-services/annotations/resource-annotations/financial-transaction-child-annotations.entity-service'
import { CreateTagDto, TagDto, UpdateTagDto } from './interfaces'

@ApiTags('tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TagsController {
  constructor(
    private annotationsEntityService: AnnotationsEntityService,
    private financialTransactionChildAnnotationEntityService: FinancialTransactionChildAnnotationEntityService
  ) {}

  @Get()
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: TagDto, isArray: true })
  async getList(@OrganizationId() organizationId: string) {
    const tags = await this.annotationsEntityService.getByTypeAndOrganizationId(
      {
        organizationId,
        type: AnnotationType.TAG
      },
      { name: Direction.ASC }
    )

    return tags.map((tag) => TagDto.map(tag))
  }

  @Post()
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 201, type: TagDto })
  async createTag(
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Body() createTagDto: CreateTagDto
  ) {
    let annotation = await this.annotationsEntityService.getOneByNameAndOrganizationId({
      organizationId,
      name: createTagDto.name
    })

    if (annotation) {
      throw new BadRequestException('Tag name already exists in the organization')
    }

    annotation = await this.annotationsEntityService.createTagByOrganizationIdAndName({
      organizationId,
      name: createTagDto.name,
      accountId
    })

    return TagDto.map(annotation)
  }

  @Put(':id')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200 })
  async updateTag(
    @Param('id') id: string,
    @OrganizationId() organizationId: string,
    @AccountId() accountId: string,
    @Body() updateTagDto: UpdateTagDto
  ) {
    const annotation = await this.annotationsEntityService.getOneByNameAndOrganizationId({
      organizationId,
      name: updateTagDto.name
    })

    if (annotation) {
      throw new BadRequestException('Tag name already exists in the organization')
    }

    await this.annotationsEntityService.updateNameByPublicIdAndOrganizationId({
      publicId: id,
      organizationId,
      name: updateTagDto.name,
      accountId
    })
  }

  @Delete(':id')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200 })
  async deleteTag(@Param('id') id: string, @OrganizationId() organizationId: string, @AccountId() accountId: string) {
    const annotation = await this.annotationsEntityService.getOneByPublicIdAndOrganizationId({
      organizationId,
      publicId: id
    })

    if (!annotation) {
      throw new BadRequestException('Tag does not exist.')
    }

    await this.financialTransactionChildAnnotationEntityService.softDeleteByAnnotation({
      annotationId: annotation.id,
      deletedBy: `account_${accountId}`
    })

    await this.annotationsEntityService.deleteById({ id: annotation.id, organizationId, accountId })
  }
}
