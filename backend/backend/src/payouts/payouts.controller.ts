import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PayoutsDomainService } from './payouts.domain.service'
import { PayoutDto } from './interfaces'
import { Response } from 'express'

@ApiTags('payouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PayoutsController {
  constructor(private payoutsDomainService: PayoutsDomainService) {}

  // NOTE: For pending transactions to retrieve payout attachments
  @Get(':id/files/:file')
  @ApiParam({ name: 'organizationId', type: 'string' })
  @ApiResponse({ status: 200, type: PayoutDto })
  async getFile(
    @Param('organizationId') organizationId: string,
    @Param('id') payoutId: string,
    @Param('file') file: string,
    @Res() res: Response
  ) {
    const { filename, mimeType, fileStream } = await this.payoutsDomainService.getFile(organizationId, payoutId, file)

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`
    })
    fileStream.pipe(res)
  }
}
