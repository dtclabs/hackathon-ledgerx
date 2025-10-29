import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  Req,
  ValidationPipe
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { PaginationResponse } from '../core/interfaces'
import { AnalysisEventTracker } from './analysis-event-tracker.entity'
import { Analysis } from './analysis.entity'
import { AnalysisService } from './analysis.service'
import {
  AnalysisQuery,
  CreateAnalysisCreatePayoutDto,
  CreateAnalysisCreateTransactionDto,
  CreateAnalysisDto,
  CreateAnalysisEventTrackerDto
} from './interface'

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(private analysisService: AnalysisService) {}

  @Get()
  @ApiResponse({ status: 200, type: PaginationResponse })
  async getAll(@Query() query: AnalysisQuery) {
    const analysis = await this.analysisService.getAllAnalysis(query)
    if (analysis) {
      return analysis
    }

    throw new NotFoundException()
  }

  @Post()
  @ApiResponse({ status: 200, type: Analysis })
  async create(@Body(new ValidationPipe()) createAnalysisDto: CreateAnalysisDto, @Req() req: Request) {
    try {
      const analysis = new Analysis()
      analysis.url = createAnalysisDto.url
      analysis.event = createAnalysisDto.event
      analysis.referrer = createAnalysisDto.referrer
      analysis.sourceIp = req.ip
      analysis.timestamp = new Date()
      analysis.userAgent = createAnalysisDto.userAgent
      analysis.payload = createAnalysisDto.payload

      return await this.analysisService.create(analysis)
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  @Post('interaction')
  @ApiResponse({ status: 200, type: AnalysisEventTracker })
  async createAnalysisEventTracker(
    @Body(new ValidationPipe()) createAnalysisEventTrackerDto: CreateAnalysisEventTrackerDto
  ) {
    return await this.analysisService.createAnalysisEventTracker(createAnalysisEventTrackerDto)
  }

  @Post('create-transaction')
  @ApiResponse({ status: 200, type: AnalysisEventTracker })
  async createAnalysisCreateTransaction(
    @Body(new ValidationPipe()) createAnalysisCreateTransactionDto: CreateAnalysisCreateTransactionDto
  ) {
    return await this.analysisService.createAnalysisCreateTransaction(createAnalysisCreateTransactionDto)
  }

  @Post('create-payout')
  @ApiResponse({ status: 200, type: AnalysisEventTracker })
  async createAnalysisCreatePayout(
    @Body(new ValidationPipe()) createAnalysisCreatePayoutDto: CreateAnalysisCreatePayoutDto
  ) {
    return await this.analysisService.createAnalysisCreatePayout(createAnalysisCreatePayoutDto)
  }
}
