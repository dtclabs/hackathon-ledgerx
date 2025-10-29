import { BadRequestException, Injectable, NotFoundException, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3 } from 'aws-sdk'
import { PutObjectRequest } from 'aws-sdk/clients/s3'
import { Readable } from 'stream'
import { v4 as uuidv4 } from 'uuid'
import { ExportWorkflowType } from '../shared/entity-services/export-workflows/interface'
import { FinancialTransactionChild } from '../shared/entity-services/financial-transactions/financial-transaction-child.entity'
import { Organization } from '../shared/entity-services/organizations/organization.entity'
import { Payout } from '../shared/entity-services/payouts/payout.entity'
import { LoggerService } from '../shared/logger/logger.service'
import { BucketSelector } from './interfaces'

@Injectable()
export class FilesService {
  AWS_S3_BUCKET: string
  PUBLIC_AWS_S3_BUCKET: string
  PRIVATE_AWS_S3_BUCKET: string
  AWS_S3_ACCESS_KEY: string
  AWS_S3_KEY_SECRET: string
  AWS_S3_REGION: string
  S3_URL: string
  s3: S3

  constructor(private readonly configService: ConfigService, private logger: LoggerService) {
    this.AWS_S3_BUCKET = this.configService.get('AWS_S3_BUCKET')
    this.PUBLIC_AWS_S3_BUCKET = this.configService.get('PUBLIC_AWS_S3_BUCKET')
    this.PRIVATE_AWS_S3_BUCKET = this.configService.get('PRIVATE_AWS_S3_BUCKET')
    this.AWS_S3_ACCESS_KEY = this.configService.get('AWS_S3_ACCESS_KEY')
    this.AWS_S3_KEY_SECRET = this.configService.get('AWS_S3_KEY_SECRET')
    this.AWS_S3_REGION = this.configService.get('AWS_S3_REGION')
    this.S3_URL = this.configService.get('S3_URL')

    this.logger.info(this.AWS_S3_ACCESS_KEY)
    this.logger.info(this.AWS_S3_KEY_SECRET)

    this.s3 = new S3({
      credentials: {
        accessKeyId: this.AWS_S3_ACCESS_KEY,
        secretAccessKey: this.AWS_S3_KEY_SECRET,
      },
      endpoint: `${this.configService.get('R2_ENDPOINT')}`,
      region: this.AWS_S3_REGION
    })
  }

  async uploadToS3(buffer: Buffer, path: string, bucketSelector: BucketSelector, contentType?: string) {
    let bucket = null
    if (bucketSelector === BucketSelector.PUBLIC) {
      bucket = this.PUBLIC_AWS_S3_BUCKET
    } else {
      bucket = this.PRIVATE_AWS_S3_BUCKET
    }

    const params: PutObjectRequest = {
      Bucket: bucket,
      Body: buffer,
      Key: path,
      ContentType: contentType ?? undefined
    }

    try {
      const uploadResult = await this.s3.upload(params).promise()
      return {
        key: path,
        bucket: bucket,
        filePath: uploadResult.Location
      }
    } catch (error) {
      this.logger.error('uploadToS3 fails', path, error)
    }
  }

  async getS3ObjectMetadata(fileKey: string, bucket: string) {
    try {
      return await this.s3
        .headObject({
          Key: fileKey,
          Bucket: bucket
        })
        .promise()
    } catch (error) {
      throw new NotFoundException()
    }
  }

  async getFileStreamFromS3(fileKey: string, bucket: string) {
    const params = {
      Key: fileKey,
      Bucket: bucket
    }

    return this.s3
      .getObject(params)
      .createReadStream()
      .on('error', (error) => {
        this.logger.error('Error getting file stream from S3', error, params)
      })
  }

  async uploadFile(files: Express.Multer.File[]) {
    const length = files.length
    const fileKey: string[] = []
    try {
      for (let i = 0; i < length; i++) {
        const file = files[i]
        const key = `${uuidv4()}-${file.originalname}`
        this.logger.info(`uploadFile ${key} start..`)
        const uploadResult = await this.s3
          .upload({
            Bucket: this.AWS_S3_BUCKET,
            Body: file.buffer,
            Key: key,
            ContentType: file.mimetype
          })
          .promise()
        fileKey.push(uploadResult.Key)
        this.logger.info(`uploadFile ${key} completed..`)
      }
      return fileKey
    } catch (error) {
      this.logger.error('uploadFile fails', error)
      throw new BadRequestException('Failed to upload files')
    }
  }

  async getFile(key: string, @Res() res) {
    try {
      const stream = this.getFileStream(key)
      stream.pipe(res)
    } catch (error) {
      return res.status(500).json(`Failed to upload file: ${error}`)
    }
  }

  getFileStream(fileKey) {
    return this.getFileS3Response(fileKey).createReadStream()
  }

  getFileS3Response(fileKey) {
    const params = {
      Key: fileKey,
      Bucket: this.AWS_S3_BUCKET
    }

    return this.s3.getObject(params)
  }

  async uploadTransactionAttachment(params: {
    file: Express.Multer.File
    organizationPublicId: string
    financialTransactionChildPublicId: string
  }) {
    const path = this.getPathToTransactionAttachment(
      params.organizationPublicId,
      params.financialTransactionChildPublicId
    )
    const file = params.file
    const { bucket, filePath, key } = await this.uploadToS3(file.buffer, path, BucketSelector.PRIVATE, file.mimetype)
    return {
      key,
      filePath,
      bucket
    }
  }

  getTransactionAttachmentStream(params: { bucket: string; key: string }) {
    return this.getFileStreamFromS3(params.key, params.bucket)
  }

  private getPathToTransactionAttachment(organizationPublicId: string, financialTransactionChildPublicId: string) {
    return `organizations/files/${organizationPublicId}/financial_transaction_children/${financialTransactionChildPublicId}/${uuidv4()}`
  }

  getPathToOrganizationExportFiles(publicOrganizationId: string) {
    return `organizations/files/${publicOrganizationId}/export/${uuidv4()}`
  }
  getPathToOrganizationExportWorkflowFiles(publicOrganizationId: string, exportWorkflowType: ExportWorkflowType) {
    return `organizations/files/${publicOrganizationId}/export_workflow/${exportWorkflowType}/${uuidv4()}`
  }

  getURLToHqLogo() {
    return `https://${this.PUBLIC_AWS_S3_BUCKET}.s3.${this.AWS_S3_REGION}.amazonaws.com/hq-icons/hq-logo-dark.png`
  }

  async getExportFileStream(bucketSelector: BucketSelector, key: string) {
    let bucket = null

    if (bucketSelector === BucketSelector.PUBLIC) {
      bucket = this.PUBLIC_AWS_S3_BUCKET
    } else {
      bucket = this.PRIVATE_AWS_S3_BUCKET
    }

    const { ContentType: mimeType } = await this.getS3ObjectMetadata(key, bucket)

    const fileStream = await this.getFileStreamFromS3(key, bucket)

    return { mimeType, fileStream }
  }

  copyFileFromTo(
    from: {
      bucket: string
      key: string
    },
    to: {
      bucket: string
      key: string
    }
  ) {
    const params: S3.Types.CopyObjectRequest = {
      Bucket: to.bucket,
      CopySource: `${from.bucket}/${from.key}`,
      Key: to.key,
      MetadataDirective: 'COPY'
    }

    return this.s3.copyObject(params).promise()
  }

  async getPayoutObject(params: {
    publicOrganizationId: string
    publicPayoutId: string
    filename: string
  }): Promise<{ filename: string; mimeType: string; fileStream: Readable }> {
    const fileKey = this.getPayoutObjectKey(params.publicOrganizationId, params.publicPayoutId, params.filename)
    const bucket = this.PRIVATE_AWS_S3_BUCKET
    const metadata = await this.getS3ObjectMetadata(fileKey, bucket)
    const mimeType = metadata.ContentType
    const fileStream = await this.getFileStreamFromS3(fileKey, bucket)
    return { filename: params.filename, mimeType, fileStream }
  }

  async getPaymentObject(params: {
    publicOrganizationId: string
    publicPaymentId: string
    filename: string
  }): Promise<{ filename: string; mimeType: string; fileStream: Readable }> {
    const fileKey = this.getPaymentObjectKey(params.publicOrganizationId, params.publicPaymentId, params.filename)
    const bucket = this.PRIVATE_AWS_S3_BUCKET
    const metadata = await this.getS3ObjectMetadata(fileKey, bucket)
    const mimeType = metadata.ContentType
    const fileStream = await this.getFileStreamFromS3(fileKey, bucket)
    return { filename: params.filename, mimeType, fileStream }
  }

  async copyFromPublicBucketToPayment(params: {
    organizationPublicId: string
    paymentPublicId: string
    filename: string
  }) {
    return await this.copyFileFromTo(
      {
        bucket: this.AWS_S3_BUCKET,
        key: params.filename
      },
      {
        bucket: this.PRIVATE_AWS_S3_BUCKET,
        key: this.getPaymentObjectKey(params.organizationPublicId, params.paymentPublicId, params.filename)
      }
    )
  }

  async copyFromPublicBucketToPayout(organization: Organization, payout: Payout, filename: string) {
    return await this.copyFileFromTo(
      {
        bucket: this.AWS_S3_BUCKET,
        key: filename
      },
      {
        bucket: this.PRIVATE_AWS_S3_BUCKET,
        key: this.getPayoutObjectKey(organization.publicId, payout.publicId, filename)
      }
    )
  }

  async copyFromPublicBucketToTransactionAttachment(
    organization: Organization,
    financialTransactionChild: FinancialTransactionChild,
    objectKey: string
  ) {
    return await this.copyToTransactionAttachment({
      fromBucket: this.AWS_S3_BUCKET,
      fromKey: objectKey,
      publicOrganizationId: organization.publicId,
      financialTransactionChildPublicId: financialTransactionChild.publicId
    })
  }

  async copyFromPayoutToTransactionAttachment(
    payout: Payout,
    organization: Organization,
    financialTransactionChild: FinancialTransactionChild,
    filename: string
  ) {
    return await this.copyToTransactionAttachment({
      fromBucket: this.PRIVATE_AWS_S3_BUCKET,
      fromKey: this.getPayoutObjectKey(organization.publicId, payout.publicId, filename),
      publicOrganizationId: organization.publicId,
      financialTransactionChildPublicId: financialTransactionChild.publicId
    })
  }

  async copyFromPaymentToTransactionAttachment(params: {
    paymentPublicId: string
    organizationPublicId: string
    financialTransactionChildPublicId: string
    filename: string
  }) {
    return await this.copyToTransactionAttachment({
      fromBucket: this.PRIVATE_AWS_S3_BUCKET,
      fromKey: this.getPaymentObjectKey(params.organizationPublicId, params.paymentPublicId, params.filename),
      publicOrganizationId: params.organizationPublicId,
      financialTransactionChildPublicId: params.financialTransactionChildPublicId
    })
  }

  async copyToTransactionAttachment(params: {
    fromBucket: string
    fromKey: string
    publicOrganizationId: string
    financialTransactionChildPublicId: string
  }) {
    const key = this.getPathToTransactionAttachment(
      params.publicOrganizationId,
      params.financialTransactionChildPublicId
    )

    await this.copyFileFromTo(
      {
        key: params.fromKey,
        bucket: params.fromBucket
      },
      {
        key: key,
        bucket: this.PRIVATE_AWS_S3_BUCKET
      }
    )

    const metadata = await this.getFileMetadata(key, this.PRIVATE_AWS_S3_BUCKET)
    const filePath = `https://${this.PRIVATE_AWS_S3_BUCKET}.s3.${this.AWS_S3_REGION}.amazonaws.com/${key}`

    return {
      key: key,
      filePath: filePath,
      bucket: this.PRIVATE_AWS_S3_BUCKET,
      contentType: metadata.ContentType,
      contentLength: metadata.ContentLength
    }
  }

  async getFileMetadata(key: string, bucket: string) {
    const params = {
      Bucket: bucket,
      Key: key
    }

    return this.s3.headObject(params).promise()
  }

  private getPaymentObjectKey(organizationPublicId: string, paymentPublicId: string, filename: string): string {
    return `organizations/files/${organizationPublicId}/payments/${paymentPublicId}/${filename}`
  }

  private getPayoutObjectKey(organizationPublicId: string, payoutPublicId: string, filename: string): string {
    return `organizations/files/${organizationPublicId}/payouts/${payoutPublicId}/${filename}`
  }
}
