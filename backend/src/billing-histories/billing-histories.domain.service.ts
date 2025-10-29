import { Injectable } from '@nestjs/common'
import { BillingHistoriesEntityService } from '../shared/entity-services/billing-histories/billing-histories.entity-service'
import { BillingHistoriesQueryParams, BillingHistoryDto } from './interfaces'
import { PaginationResponse } from '../core/interfaces'
import { FilesService } from '../files/files.service'

@Injectable()
export class BillingHistoriesDomainService {
  constructor(
    private billingHistoriesEntityService: BillingHistoriesEntityService,
    private filesService: FilesService
  ) {}

  async getAllPaging(organizationId: string, query: BillingHistoriesQueryParams) {
    const response = await this.billingHistoriesEntityService.getAllPaging(query, [], {
      organization: {
        id: organizationId
      }
    })

    return PaginationResponse.from({
      items: response.items.map((item) => BillingHistoryDto.map(item)),
      limit: response.limit,
      totalItems: response.totalItems,
      currentPage: response.currentPage
    })
  }

  async getInvoice(organizationId: string, billingHistoryId: string) {
    const billingHistory = await this.billingHistoriesEntityService.findOne({
      where: {
        publicId: billingHistoryId,
        organization: { publicId: organizationId }
      }
    })
    if (!billingHistory.invoiceMetadata?.s3Filename) return null

    const filename = billingHistory.invoiceMetadata.s3Filename
    const fileKey = `organizations/files/${organizationId}/invoices/${filename}`
    const bucket = this.filesService.PRIVATE_AWS_S3_BUCKET
    const metadata = await this.filesService.getS3ObjectMetadata(fileKey, bucket)
    const mimeType = metadata.ContentType
    const fileStream = await this.filesService.getFileStreamFromS3(fileKey, bucket)
    return { filename, mimeType, fileStream }
  }
}
