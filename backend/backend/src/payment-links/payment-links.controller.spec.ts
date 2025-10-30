import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Token } from '../shared/entity-services/tokens/token.entity'
import { PaymentLinksController } from './payment-links.controller'
import { TokensEntityService } from '../shared/entity-services/tokens/tokens.entity-service'

describe('TokensController', () => {
  let controller: PaymentLinksController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentLinksController],
      providers: [TokensEntityService, { provide: getRepositoryToken(Token), useClass: Repository }]
    }).compile()

    controller = module.get<PaymentLinksController>(PaymentLinksController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
