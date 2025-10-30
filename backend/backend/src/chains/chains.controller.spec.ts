import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Chain } from '../shared/entity-services/chains/chain.entity'
import { ChainsController } from './chains.controller'
import { ChainsEntityService } from '../shared/entity-services/chains/chains.entity-service'

describe('ChainsController', () => {
  let controller: ChainsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChainsController],
      providers: [ChainsEntityService, { provide: getRepositoryToken(Chain), useClass: Repository }]
    }).compile()

    controller = module.get<ChainsController>(ChainsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
