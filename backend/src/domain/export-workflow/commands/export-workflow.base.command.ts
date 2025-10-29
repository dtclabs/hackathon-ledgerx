import {
  ExportWorkflowFileType,
  ExportWorkflowStatus,
  ExportWorkflowType
} from '../../../shared/entity-services/export-workflows/interface'
import { LoggerService } from '../../../shared/logger/logger.service'
import { ExportWorkflow } from '../../../shared/entity-services/export-workflows/export-workflow.entity'
import { ExportWorkflowsEntityService } from '../../../shared/entity-services/export-workflows/export-workflows.entity.service'
import { dateHelper } from '../../../shared/helpers/date.helper'
import { CsvStringifierFactory } from '../../../shared/csv/csv-stringifier-factory'
import { FilesService } from '../../../files/files.service'
import { BucketSelector } from '../../../files/interfaces'
import { OrganizationsEntityService } from '../../../shared/entity-services/organizations/organizations.entity-service'
import puppeteer, { PDFOptions } from 'puppeteer'
import Decimal from 'decimal.js'
import { PdfLink } from './spot-balance/spot-balance-template.pdf.builder'
import { csvUtils } from '../../../shared/csv/utils'

export abstract class ExportWorkflowBaseCommand<T> {
  constructor(
    protected logger: LoggerService,
    protected exportWorkflowsEntityService: ExportWorkflowsEntityService,
    protected filesService: FilesService,
    protected organizationsEntityService: OrganizationsEntityService
  ) {}

  public async executeWorkflow(workflow: ExportWorkflow): Promise<void> {
    try {
      if (workflow.status === ExportWorkflowStatus.CREATED) {
        await this.execute(workflow)
      } else {
        await this.handleWrongStateForExecution(workflow)
      }
    } catch (e) {
      await this.handleError(workflow.id, workflow.organizationId, e)
    }
  }

  protected async execute(workflow: ExportWorkflow): Promise<void> {
    try {
      await this.startExecuting(workflow.id)

      const fileData = await this.prepareData(workflow)

      const organization = await this.organizationsEntityService.findOne({ where: { id: workflow.organizationId } })

      const fileContent = await this.getBufferForExport(fileData, workflow.fileType)

      const fileName = await this.saveBufferToS3({
        fileContent,
        publicOrganizationId: organization.publicId,
        exportWorkflowType: workflow.type,
        fileType: workflow.fileType
      })
      await this.exportWorkflowsEntityService.updateS3FileName(workflow.id, fileName)

      await this.complete(workflow.id)
    } catch (e) {
      await this.handleError(workflow.id, workflow.organizationId, e)
    }
  }

  protected async startExecuting(workflowId: string) {
    return this.exportWorkflowsEntityService.changeStatus(workflowId, ExportWorkflowStatus.GENERATING, {
      lastExecutedAt: dateHelper.getUTCTimestamp()
    })
  }

  protected async handleError(workflowId: string, organizationId: string, error: any) {
    this.logger.error(`Export workflow ${workflowId} has errors`, error, { workflowId, organizationId })
    return this.exportWorkflowsEntityService.changeStatus(workflowId, ExportWorkflowStatus.FAILED, {
      error
    })
  }

  protected async prepareData(workflow: ExportWorkflow) {
    const allData = await this.collectData(workflow)
    return await this.transformDataToFileExport(workflow, allData)
  }

  protected abstract collectData(workflow: ExportWorkflow): Promise<T[]>

  protected abstract transformDataToFileExport(workflow: ExportWorkflow, data: T[]): Promise<string>

  protected generateCSV(params: { headers: string[]; csvData: string[][] }): string {
    const csvStringifier = CsvStringifierFactory.createArrayCsvStringifier({
      header: params.headers
    })

    return csvStringifier.getCsvString(params.csvData)
  }

  protected async saveBufferToS3(params: {
    fileContent: Buffer
    publicOrganizationId: string
    fileType: ExportWorkflowFileType
    exportWorkflowType: ExportWorkflowType
  }) {
    try {
      const filePath = this.filesService.getPathToOrganizationExportWorkflowFiles(
        params.publicOrganizationId,
        params.exportWorkflowType
      )
      const { key } = await this.filesService.uploadToS3(
        params.fileContent,
        filePath,
        BucketSelector.PRIVATE,
        params.fileType
      )
      return key
    } catch (e) {
      this.logger.error(`Can not save csv file to S3`, e, {
        publicOrganizationId: params.publicOrganizationId,
        fileType: params.fileType
      })
      throw e
    }
  }

  protected async handleWrongStateForExecution(workflow: ExportWorkflow) {
    throw new Error(`Export workflow ${workflow.id} has wrong state for execution: ${workflow.status}`)
  }

  protected async complete(workflowId: string) {
    return this.exportWorkflowsEntityService.changeStatus(workflowId, ExportWorkflowStatus.COMPLETED, {
      completedAt: dateHelper.getUTCTimestamp()
    })
  }

  private async getBufferForExport(fileData: string, fileType: ExportWorkflowFileType) {
    switch (fileType) {
      case ExportWorkflowFileType.CSV:
        return Buffer.from(fileData)
      case ExportWorkflowFileType.PDF: {
        try {
          const browser = await puppeteer.launch({
            headless: 'new',
            ignoreDefaultArgs: ['--disable-extensions'],
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          })
          const page = await browser.newPage()
          const options: PDFOptions = { format: 'A4', landscape: true, printBackground: true }
          await page.setContent(fileData)

          const buffer = await page.pdf(options)
          await browser.close()
          return buffer
        } catch (e) {
          this.logger.error(`Can not generate PDF`, e, { fileData, fileType })
          throw new Error(`Can not generate PDF: ${e.message}`)
        }
      }
      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }
  }

  getPdfWidths(width: ExportColumnWidthEnum): string {
    if (!width) {
      return null
    }
    switch (width) {
      case ExportColumnWidthEnum.sm:
        return '2rem'
      case ExportColumnWidthEnum.md:
        return '4rem'
      case ExportColumnWidthEnum.lg:
        return '5rem'
    }
  }

  getValueForPdfCell(value: CellValueType, column: ExportColumn): string {
    if (value instanceof Decimal) {
      if (column.decimals) {
        return value.toDecimalPlaces(column.decimals).toString()
      } else {
        return value.toString()
      }
    } else if (value instanceof UrlLink) {
      return new PdfLink(value.url, value.title).toString()
    }
    return value
  }

  getValueForCsvCell(value: CellValueType, column: ExportColumn): string {
    if (value instanceof Decimal) {
      return value.toString()
    } else if (value instanceof UrlLink) {
      return csvUtils.getHyperlink(value.url, value.title)
    }
    return value
  }
}

export class ExportColumn {
  public name: string
  public width?: ExportColumnWidthEnum
  public decimals?: number

  constructor(params: { name: string; width?: ExportColumnWidthEnum; decimalPlaces?: number }) {
    this.name = params.name
    this.width = params.width
    this.decimals = params.decimalPlaces
  }
}

export class UrlLink {
  constructor(public readonly title: string, public url: string) {}
}

export type CellValueType = string | Decimal | UrlLink

export enum ExportColumnWidthEnum {
  sm = 'sm',
  md = 'md',
  lg = 'lg'
}
