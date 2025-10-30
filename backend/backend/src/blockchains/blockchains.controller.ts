import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { BlockchainsEntityService } from '../shared/entity-services/blockchains/blockchains.entity-service'
import { BlockchainsDetailedDto } from './interfaces'

@ApiTags('blockchains')
@Controller()
export class BlockchainsController {
  constructor(private blockchainsService: BlockchainsEntityService) {}

  @Get()
  @ApiOperation({
    summary: 'Get supported Solana blockchains',
    description: 'Returns only Solana blockchain networks (mainnet, devnet, etc.). EVM blockchains are not supported.'
  })
  @ApiResponse({ status: 200, type: BlockchainsDetailedDto, isArray: true })
  async getAll() {
    // Get only Solana blockchains
    const solanaBlockchains = await this.blockchainsService.getSolanaBlockchains()

    return solanaBlockchains.map((blockchain) => BlockchainsDetailedDto.map(blockchain))
  }
}
