// implement unit tests for AlchemyAdapter using jest

import { Test, TestingModule } from '@nestjs/testing'
import { EvmLogIngestionProcessCommand } from './evm-log-ingestion-process.command'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { LoggerModule } from '../../../../shared/logger/logger.module'
import { ConfigService } from '@nestjs/config'
import { BlockExplorerAdapterFactory } from '../../../block-explorers/block-explorer.adapter.factory'
import { IngestionDataProviderFactory } from '../data-providers/ingestion-data-provider.factory'
import { IngestionProcessEntityService } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity.service'
import { ContractConfigurationsEntityService } from '../../../../shared/entity-services/contract-configurations/contract-configurations.entity.service'
import { TaskStatusEnum } from '../../../../core/events/event-types'
import { ingestionProcessMocks } from '../../../../../test/mock/ingestion-process.mock'
import { ContractConfigurationPlaceholderEnum } from '../../../../shared/entity-services/contract-configurations/interfaces'
import { EvmLogIngestionTaskMetadata } from '../../../../shared/entity-services/ingestion-process/interfaces'
import { getLogs } from '../../../../../test/mock/evm-logs.mock.data'
import { hexToNumber } from 'web3-utils'

describe('EvmLogIngestionProcessCommand', () => {
  let evmLogIngestionProcessCommand: EvmLogIngestionProcessCommand
  let ingestionProcessEntityService: IngestionProcessEntityService
  let ingestionDataProviderFactory: IngestionDataProviderFactory
  let blockExplorerAdapterFactory: BlockExplorerAdapterFactory
  const etherscanAdapterMock = {
    getLogs: jest.fn()
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), LoggerModule],
      providers: [
        EvmLogIngestionProcessCommand,
        {
          provide: ConfigService,
          useValue: {}
        },
        {
          provide: BlockExplorerAdapterFactory,
          useValue: {
            getEtherscanAdapter: () => etherscanAdapterMock
          }
        },
        {
          provide: IngestionDataProviderFactory,
          useValue: {}
        },
        {
          provide: IngestionProcessEntityService,
          useValue: {
            changeStatus: jest.fn()
          }
        },
        {
          provide: ContractConfigurationsEntityService,
          useValue: {}
        }
      ]
    }).compile()

    evmLogIngestionProcessCommand = app.get<EvmLogIngestionProcessCommand>(EvmLogIngestionProcessCommand)
    ingestionProcessEntityService = app.get<IngestionProcessEntityService>(IngestionProcessEntityService)
    ingestionDataProviderFactory = app.get<IngestionDataProviderFactory>(IngestionDataProviderFactory)
    blockExplorerAdapterFactory = app.get<BlockExplorerAdapterFactory>(BlockExplorerAdapterFactory)
  })

  it('should be defined', () => {
    expect(evmLogIngestionProcessCommand).toBeDefined()
  })

  describe(`check function params`, () => {
    it('executeProcess change status to Running', async () => {
      const ingestionProcessEntityService_changeStatus = jest.spyOn(ingestionProcessEntityService, 'changeStatus')
      jest.spyOn(evmLogIngestionProcessCommand, 'pullAndSaveData').mockImplementation(() => Promise.resolve())
      const ingestionProcessMock = ingestionProcessMocks.getContractConfigurationMock('transfer')
      await evmLogIngestionProcessCommand.executeProcess(ingestionProcessMock)

      expect(ingestionProcessEntityService_changeStatus).toHaveBeenCalledWith(
        ingestionProcessMock.id,
        TaskStatusEnum.RUNNING
      )
    })

    it('pullAndSaveData getHashesFromLogs for logsFrom calls with correct parameters', async () => {
      const ingestionProcessEntityService_getHashesFromLogs = jest
        .spyOn(evmLogIngestionProcessCommand as any, 'getHashesFromLogs')
        .mockImplementation(() => Promise.resolve())

      const ingestionProcessMock = ingestionProcessMocks.getContractConfigurationMock('transfer')

      const pullAndSaveDataParams = {
        ingestionProcess: ingestionProcessMock,
        blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
        address: ingestionProcessMock.ingestionWorkflow.address,
        metadata: {
          ...ingestionProcessMock.metadata,
          logsTo: true,
          logsFrom: false,
          saving: true
        } as any
      }
      await evmLogIngestionProcessCommand.pullAndSaveData(pullAndSaveDataParams)

      expect(ingestionProcessEntityService_getHashesFromLogs).toHaveBeenCalledWith({
        ...pullAndSaveDataParams,
        direction: ContractConfigurationPlaceholderEnum.ADDRESS_OUT
      })
    })

    it('pullAndSaveData getHashesFromLogs for logsTo calls with correct parameters', async () => {
      const ingestionProcessEntityService_getHashesFromLogs = jest
        .spyOn(evmLogIngestionProcessCommand as any, 'getHashesFromLogs')
        .mockImplementation(() => Promise.resolve())

      const ingestionProcessMock = ingestionProcessMocks.getContractConfigurationMock('transfer')

      const pullAndSaveDataParams = {
        ingestionProcess: ingestionProcessMock,
        blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
        address: ingestionProcessMock.ingestionWorkflow.address,
        metadata: {
          ...ingestionProcessMock.metadata,
          logsTo: false,
          logsFrom: true,
          saving: true
        } as any
      }
      await evmLogIngestionProcessCommand.pullAndSaveData(pullAndSaveDataParams)

      expect(ingestionProcessEntityService_getHashesFromLogs).toHaveBeenCalledWith({
        ...pullAndSaveDataParams,
        direction: ContractConfigurationPlaceholderEnum.ADDRESS_IN
      })
    })

    it('pullAndSaveData populateData calls with correct parameters', async () => {
      const ingestionProcessEntityService_populateData = jest
        .spyOn(evmLogIngestionProcessCommand as any, 'populateData')
        .mockImplementation(() => Promise.resolve())

      const ingestionProcessMock = ingestionProcessMocks.getContractConfigurationMock('transfer')

      const pullAndSaveDataParams = {
        ingestionProcess: ingestionProcessMock,
        blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
        address: ingestionProcessMock.ingestionWorkflow.address,
        metadata: {
          ...ingestionProcessMock.metadata,
          logsTo: true,
          logsFrom: true,
          saving: false
        } as any
      }
      await evmLogIngestionProcessCommand.pullAndSaveData(pullAndSaveDataParams)

      expect(ingestionProcessEntityService_populateData).toHaveBeenCalledWith({
        ...pullAndSaveDataParams,
        metadata: {
          ...pullAndSaveDataParams.metadata,
          pageSize: 50
        }
      })
    })
  })

  describe(`getHashesFromLogs tests`, () => {
    let ingestionProcessEntityService_saveHashes: jest.SpyInstance
    let ingestionProcessEntityService_next: jest.SpyInstance
    let etherscanAdapterMock_getLogs: jest.SpyInstance

    beforeEach(async () => {
      ingestionProcessEntityService_saveHashes = jest
        .spyOn(evmLogIngestionProcessCommand as any, 'saveHashes')
        .mockImplementation(() => Promise.resolve())

      ingestionProcessEntityService_next = jest
        .spyOn(evmLogIngestionProcessCommand as any, 'next')
        .mockImplementation(() => Promise.resolve())

      etherscanAdapterMock_getLogs = jest.spyOn(etherscanAdapterMock as any, 'getLogs')

      ingestionProcessEntityService_saveHashes.mockClear()
      ingestionProcessEntityService_next.mockClear()
      etherscanAdapterMock_getLogs.mockClear()
    })

    describe(`LogsTo`, () => {
      const ingestionProcessMock = ingestionProcessMocks.getContractConfigurationMock('transfer')
      let metadata: EvmLogIngestionTaskMetadata
      let pullAndSaveDataParams: any

      beforeEach(async () => {
        metadata = {
          ...ingestionProcessMock.metadata,
          logsTo: false,
          logsFrom: true,
          saving: true
        } as EvmLogIngestionTaskMetadata
        pullAndSaveDataParams = {
          ingestionProcess: ingestionProcessMock,
          blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
          address: ingestionProcessMock.ingestionWorkflow.address,
          metadata: metadata,
          direction: ContractConfigurationPlaceholderEnum.ADDRESS_IN
        }
      })

      it('success for Transfer', async () => {
        const logs = getLogs()
        etherscanAdapterMock_getLogs.mockImplementation(() => {
          return Promise.resolve(logs)
        })

        await (evmLogIngestionProcessCommand as any).getHashesFromLogs(pullAndSaveDataParams)

        expect(etherscanAdapterMock_getLogs).toBeCalledTimes(1)
        expect(etherscanAdapterMock_getLogs).toHaveBeenCalledWith({
          contractAddress: ingestionProcessMock.contractConfiguration.contractAddress,
          topic0: ingestionProcessMock.contractConfiguration.topic0,
          topic1: null,
          topic2: ingestionProcessMock.ingestionWorkflow.address,
          topic3: null,
          fromBlock: metadata.fromBlock,
          page: metadata.page,
          offset: metadata.pageSize
        })

        expect(ingestionProcessEntityService_saveHashes).toBeCalledTimes(1)
        expect(ingestionProcessEntityService_saveHashes).toHaveBeenCalledWith({
          address: ingestionProcessMock.ingestionWorkflow.address,
          blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
          contractConfigurationId: ingestionProcessMock.contractConfiguration.id,
          data: logs.map((log) => ({ transactionHash: log.transactionHash, blockNumber: hexToNumber(log.blockNumber) }))
        })

        expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
        expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
          ...metadata,
          page: metadata.page + 1
        })
      })
      it('returns 0 logs', async () => {
        const logs = []
        etherscanAdapterMock_getLogs.mockImplementation(() => {
          return Promise.resolve(logs)
        })

        await (evmLogIngestionProcessCommand as any).getHashesFromLogs(pullAndSaveDataParams)

        expect(etherscanAdapterMock_getLogs).toBeCalledTimes(1)
        expect(etherscanAdapterMock_getLogs).toHaveBeenCalledWith({
          contractAddress: ingestionProcessMock.contractConfiguration.contractAddress,
          topic0: ingestionProcessMock.contractConfiguration.topic0,
          topic1: null,
          topic2: ingestionProcessMock.ingestionWorkflow.address,
          topic3: null,
          fromBlock: metadata.fromBlock,
          page: metadata.page,
          offset: metadata.pageSize
        })

        expect(ingestionProcessEntityService_saveHashes).toBeCalledTimes(0)

        expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
        expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
          ...metadata,
          page: 0,
          logsTo: true
        })
      })
      it('reach Etherscan limit', async () => {
        const newMetadata = {
          ...metadata,
          page: 10
        }
        const newPullAndSaveDataParams = {
          ...pullAndSaveDataParams,
          metadata: newMetadata
        }

        const logs = getLogs()
        etherscanAdapterMock_getLogs.mockImplementation(() => {
          return Promise.resolve(logs)
        })

        await (evmLogIngestionProcessCommand as any).getHashesFromLogs(newPullAndSaveDataParams)

        expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
        expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
          ...metadata,
          page: 1,
          tempBlock: Number(hexToNumber(logs[logs.length - 1].blockNumber)) - 1
        })
      })
      it('get with tempBlock', async () => {
        const newMetadata: EvmLogIngestionTaskMetadata = {
          ...metadata,
          page: 1,
          tempBlock: 98
        }
        const newPullAndSaveDataParams = {
          ...pullAndSaveDataParams,
          metadata: newMetadata
        }

        const logs = getLogs()
        etherscanAdapterMock_getLogs.mockImplementation(() => {
          return Promise.resolve(logs)
        })

        await (evmLogIngestionProcessCommand as any).getHashesFromLogs(newPullAndSaveDataParams)

        expect(etherscanAdapterMock_getLogs).toBeCalledTimes(1)
        expect(etherscanAdapterMock_getLogs).toHaveBeenCalledWith({
          contractAddress: ingestionProcessMock.contractConfiguration.contractAddress,
          topic0: ingestionProcessMock.contractConfiguration.topic0,
          topic1: null,
          topic2: ingestionProcessMock.ingestionWorkflow.address,
          topic3: null,
          fromBlock: newMetadata.tempBlock,
          page: newMetadata.page,
          offset: newMetadata.pageSize
        })

        expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
        expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
          ...newMetadata,
          page: newMetadata.page + 1
        })
      })
    })

    describe(`LogsFrom`, () => {
      const ingestionProcessMock = ingestionProcessMocks.getContractConfigurationMock('transfer')
      let metadata: EvmLogIngestionTaskMetadata
      let pullAndSaveDataParams: any

      beforeEach(async () => {
        metadata = {
          ...ingestionProcessMock.metadata,
          logsTo: true,
          logsFrom: false,
          saving: true
        } as EvmLogIngestionTaskMetadata
        pullAndSaveDataParams = {
          ingestionProcess: ingestionProcessMock,
          blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
          address: ingestionProcessMock.ingestionWorkflow.address,
          metadata: metadata,
          direction: ContractConfigurationPlaceholderEnum.ADDRESS_OUT
        }
      })

      it('success for Transfer', async () => {
        const logs = getLogs()
        etherscanAdapterMock_getLogs.mockImplementation(() => {
          return Promise.resolve(logs)
        })

        await (evmLogIngestionProcessCommand as any).getHashesFromLogs(pullAndSaveDataParams)

        expect(etherscanAdapterMock_getLogs).toBeCalledTimes(1)
        expect(etherscanAdapterMock_getLogs).toHaveBeenCalledWith({
          contractAddress: ingestionProcessMock.contractConfiguration.contractAddress,
          topic0: ingestionProcessMock.contractConfiguration.topic0,
          topic1: ingestionProcessMock.ingestionWorkflow.address,
          topic2: null,
          topic3: null,
          fromBlock: metadata.fromBlock,
          page: metadata.page,
          offset: metadata.pageSize
        })

        expect(ingestionProcessEntityService_saveHashes).toBeCalledTimes(1)
        expect(ingestionProcessEntityService_saveHashes).toHaveBeenCalledWith({
          address: ingestionProcessMock.ingestionWorkflow.address,
          blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
          contractConfigurationId: ingestionProcessMock.contractConfiguration.id,
          data: logs.map((log) => ({ transactionHash: log.transactionHash, blockNumber: hexToNumber(log.blockNumber) }))
        })

        expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
        expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
          ...metadata,
          page: metadata.page + 1
        })
      })
      it('returns 0 logs', async () => {
        const logs = []
        etherscanAdapterMock_getLogs.mockImplementation(() => {
          return Promise.resolve(logs)
        })

        await (evmLogIngestionProcessCommand as any).getHashesFromLogs(pullAndSaveDataParams)

        expect(etherscanAdapterMock_getLogs).toBeCalledTimes(1)
        expect(etherscanAdapterMock_getLogs).toHaveBeenCalledWith({
          contractAddress: ingestionProcessMock.contractConfiguration.contractAddress,
          topic0: ingestionProcessMock.contractConfiguration.topic0,
          topic1: ingestionProcessMock.ingestionWorkflow.address,
          topic2: null,
          topic3: null,
          fromBlock: metadata.fromBlock,
          page: metadata.page,
          offset: metadata.pageSize
        })

        expect(ingestionProcessEntityService_saveHashes).toBeCalledTimes(0)

        expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
        expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
          ...metadata,
          page: 0,
          logsFrom: true
        })
      })
      it('reach Etherscan limit', async () => {
        const newMetadata = {
          ...metadata,
          page: 10
        }
        const newPullAndSaveDataParams = {
          ...pullAndSaveDataParams,
          metadata: newMetadata
        }

        const logs = getLogs()
        etherscanAdapterMock_getLogs.mockImplementation(() => {
          return Promise.resolve(logs)
        })

        await (evmLogIngestionProcessCommand as any).getHashesFromLogs(newPullAndSaveDataParams)

        expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
        expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
          ...metadata,
          page: 1,
          tempBlock: Number(hexToNumber(logs[logs.length - 1].blockNumber)) - 1
        })
      })
      it('get with tempBlock', async () => {
        const newMetadata: EvmLogIngestionTaskMetadata = {
          ...metadata,
          page: 1,
          tempBlock: 98
        }
        const newPullAndSaveDataParams = {
          ...pullAndSaveDataParams,
          metadata: newMetadata
        }

        const logs = getLogs()
        etherscanAdapterMock_getLogs.mockImplementation(() => {
          return Promise.resolve(logs)
        })

        await (evmLogIngestionProcessCommand as any).getHashesFromLogs(newPullAndSaveDataParams)

        expect(etherscanAdapterMock_getLogs).toBeCalledTimes(1)
        expect(etherscanAdapterMock_getLogs).toHaveBeenCalledWith({
          contractAddress: ingestionProcessMock.contractConfiguration.contractAddress,
          topic0: ingestionProcessMock.contractConfiguration.topic0,
          topic1: ingestionProcessMock.ingestionWorkflow.address,
          topic2: null,
          topic3: null,
          fromBlock: newMetadata.tempBlock,
          page: newMetadata.page,
          offset: newMetadata.pageSize
        })

        expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
        expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
          ...newMetadata,
          page: newMetadata.page + 1
        })
      })
    })
  })
})
