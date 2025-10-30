import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { Token } from './token.entity'

@Injectable()
export class TokensEntityService extends BaseEntityService<Token> {
  constructor(
    @InjectRepository(Token)
    private tokensRepository: Repository<Token>
  ) {
    super(tokensRepository)
  }

  async getBySymbol(symbol: string) {
    return this.tokensRepository.findOne({ where: { name: symbol } })
  }
}
