import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Token } from '../shared/entity-services/tokens/token.entity'
import { TokensController } from './tokens.controller'
import { TokensEntityService } from '../shared/entity-services/tokens/tokens.entity-service'

describe('TokensController', () => {
  let controller: TokensController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokensController],
      providers: [TokensEntityService, { provide: getRepositoryToken(Token), useClass: Repository }]
    }).compile()

    controller = module.get<TokensController>(TokensController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
