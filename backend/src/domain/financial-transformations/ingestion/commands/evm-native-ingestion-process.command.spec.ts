import { Test, TestingModule } from '@nestjs/testing'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { LoggerModule } from '../../../../shared/logger/logger.module'
import { ConfigService } from '@nestjs/config'
import { BlockExplorerAdapterFactory } from '../../../block-explorers/block-explorer.adapter.factory'
import { IngestionDataProviderFactory } from '../data-providers/ingestion-data-provider.factory'
import { IngestionProcessEntityService } from '../../../../shared/entity-services/ingestion-process/ingestion-process.entity.service'
import { ContractConfigurationsEntityService } from '../../../../shared/entity-services/contract-configurations/contract-configurations.entity.service'
import { TaskStatusEnum } from '../../../../core/events/event-types'
import { ingestionProcessMocks } from '../../../../../test/mock/ingestion-process.mock'
import { EvmNativeIngestionTaskMetadata } from '../../../../shared/entity-services/ingestion-process/interfaces'
import { EvmNativeIngestionProcessCommand } from './evm-native-ingestion-process-command.service'
import { getTraces } from '../../../../../test/mock/evm-traces.mock.data'
import { EvmDataProviderService } from '../data-providers/interfaces'
import { getExternals } from '../../../../../test/mock/evm-external.mock.data'

describe('EvmNativeIngestionProcessCommand', () => {
  let evmNativeIngestionProcessCommand: EvmNativeIngestionProcessCommand
  let ingestionProcessEntityService: IngestionProcessEntityService
  let ingestionDataProviderFactory: IngestionDataProviderFactory
  let blockExplorerAdapterFactory: BlockExplorerAdapterFactory
  let ingestionDataProviderMock: EvmDataProviderService = {
    saveTransactionDetails: jest.fn()
  } as any
  const etherscanAdapterMock = {
    getTransactionInternals: jest.fn(),
    getTransactionExternals: jest.fn(),
    getTransactionInternalsByAddress: jest.fn()
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot(), LoggerModule],
      providers: [
        EvmNativeIngestionProcessCommand,
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
          useValue: {
            getProvider: () => ingestionDataProviderMock
          }
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

    evmNativeIngestionProcessCommand = app.get<EvmNativeIngestionProcessCommand>(EvmNativeIngestionProcessCommand)
    ingestionProcessEntityService = app.get<IngestionProcessEntityService>(IngestionProcessEntityService)
    ingestionDataProviderFactory = app.get<IngestionDataProviderFactory>(IngestionDataProviderFactory)
    blockExplorerAdapterFactory = app.get<BlockExplorerAdapterFactory>(BlockExplorerAdapterFactory)
  })

  it('should be defined', () => {
    expect(evmNativeIngestionProcessCommand).toBeDefined()
  })

  describe(`check function params`, () => {
    it('executeProcess change status to Running', async () => {
      const ingestionProcessEntityService_changeStatus = jest.spyOn(ingestionProcessEntityService, 'changeStatus')
      jest.spyOn(evmNativeIngestionProcessCommand, 'pullAndSaveData').mockImplementation(() => Promise.resolve())
      const ingestionProcessMock = ingestionProcessMocks.getNativeMock()
      await evmNativeIngestionProcessCommand.executeProcess(ingestionProcessMock)

      expect(ingestionProcessEntityService_changeStatus).toHaveBeenCalledWith(
        ingestionProcessMock.id,
        TaskStatusEnum.RUNNING
      )
    })

    it('pullAndSaveData getHashesFromExternal calls with correct parameters', async () => {
      const ingestionProcessEntityService_getHashesFromExternal = jest
        .spyOn(evmNativeIngestionProcessCommand as any, 'getHashesFromExternal')
        .mockImplementation(() => Promise.resolve())

      const ingestionProcessMock = ingestionProcessMocks.getNativeMock()

      const pullAndSaveDataParams = {
        ingestionProcess: ingestionProcessMock,
        blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
        address: ingestionProcessMock.ingestionWorkflow.address,
        metadata: {
          ...ingestionProcessMock.metadata,
          external: false,
          traces: true,
          saving: true
        } as EvmNativeIngestionTaskMetadata
      }
      await evmNativeIngestionProcessCommand.pullAndSaveData(pullAndSaveDataParams)

      expect(ingestionProcessEntityService_getHashesFromExternal).toHaveBeenCalledWith({
        ingestionProcess: ingestionProcessMock,
        blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
        address: ingestionProcessMock.ingestionWorkflow.address,
        metadata: pullAndSaveDataParams.metadata
      })
    })

    it('pullAndSaveData getHashesFromTraces calls with correct parameters', async () => {
      const ingestionProcessEntityService_getHashesFromExternal = jest
        .spyOn(evmNativeIngestionProcessCommand as any, 'getHashesFromTraces')
        .mockImplementation(() => Promise.resolve())

      const ingestionProcessMock = ingestionProcessMocks.getNativeMock()

      const pullAndSaveDataParams = {
        ingestionProcess: ingestionProcessMock,
        blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
        address: ingestionProcessMock.ingestionWorkflow.address,
        metadata: {
          ...ingestionProcessMock.metadata,
          external: true,
          traces: false,
          saving: true
        } as EvmNativeIngestionTaskMetadata
      }
      await evmNativeIngestionProcessCommand.pullAndSaveData(pullAndSaveDataParams)

      expect(ingestionProcessEntityService_getHashesFromExternal).toHaveBeenCalledWith(pullAndSaveDataParams)
    })

    it('pullAndSaveData populateData calls with correct parameters', async () => {
      const ingestionProcessEntityService_populateData = jest
        .spyOn(evmNativeIngestionProcessCommand as any, 'populateData')
        .mockImplementation(() => Promise.resolve())

      const ingestionProcessMock = ingestionProcessMocks.getNativeMock()

      const pullAndSaveDataParams = {
        ingestionProcess: ingestionProcessMock,
        blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
        address: ingestionProcessMock.ingestionWorkflow.address,
        metadata: {
          ...ingestionProcessMock.metadata,
          external: true,
          traces: true,
          saving: false
        } as EvmNativeIngestionTaskMetadata
      }
      await evmNativeIngestionProcessCommand.pullAndSaveData(pullAndSaveDataParams)

      expect(ingestionProcessEntityService_populateData).toHaveBeenCalledWith({
        ...pullAndSaveDataParams,
        metadata: {
          ...pullAndSaveDataParams.metadata,
          pageSize: 50
        }
      })
    })
  })

  describe(`getHashesFromTraces tests`, () => {
    let ingestionProcessEntityService_saveHashes: jest.SpyInstance
    let ingestionProcessEntityService_next: jest.SpyInstance
    let etherscanAdapterMock_getTransactionInternals: jest.SpyInstance
    let etherscanAdapterMock_getTransactionInternalsByAddress: jest.SpyInstance
    let ingestionDataProviderMock_saveTransactionDetails: jest.SpyInstance

    const ingestionProcessMock = ingestionProcessMocks.getNativeMock()
    let metadata: EvmNativeIngestionTaskMetadata
    let pullAndSaveDataParams: any

    beforeEach(async () => {
      ingestionProcessEntityService_saveHashes = jest
        .spyOn(evmNativeIngestionProcessCommand as any, 'saveHashes')
        .mockImplementation(() => Promise.resolve())

      ingestionProcessEntityService_next = jest
        .spyOn(evmNativeIngestionProcessCommand as any, 'next')
        .mockImplementation(() => Promise.resolve())

      etherscanAdapterMock_getTransactionInternals = jest.spyOn(etherscanAdapterMock as any, 'getTransactionInternals')
      etherscanAdapterMock_getTransactionInternalsByAddress = jest.spyOn(
        etherscanAdapterMock as any,
        'getTransactionInternalsByAddress'
      )
      ingestionDataProviderMock_saveTransactionDetails = jest.spyOn(
        ingestionDataProviderMock as any,
        'saveTransactionDetails'
      )

      ingestionProcessEntityService_saveHashes.mockClear()
      ingestionProcessEntityService_next.mockClear()
      etherscanAdapterMock_getTransactionInternals.mockClear()
      etherscanAdapterMock_getTransactionInternalsByAddress.mockClear()
      ingestionDataProviderMock_saveTransactionDetails.mockClear()

      metadata = {
        ...ingestionProcessMock.metadata,
        external: true,
        traces: false,
        saving: true
      } as EvmNativeIngestionTaskMetadata
      pullAndSaveDataParams = {
        ingestionProcess: ingestionProcessMock,
        blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
        address: ingestionProcessMock.ingestionWorkflow.address,
        metadata: metadata
      }
    })

    it('success for internals', async () => {
      const traces = getTraces()
      etherscanAdapterMock_getTransactionInternalsByAddress.mockImplementation(() => {
        return Promise.resolve(traces)
      })

      await (evmNativeIngestionProcessCommand as any).pullAndSaveData(pullAndSaveDataParams)

      expect(etherscanAdapterMock_getTransactionInternalsByAddress).toBeCalledTimes(1)
      expect(etherscanAdapterMock_getTransactionInternalsByAddress).toHaveBeenCalledWith({
        address: ingestionProcessMock.ingestionWorkflow.address,
        fromBlock: metadata.fromBlock,
        page: metadata.page,
        offset: metadata.pageSize
      })

      expect(ingestionProcessEntityService_saveHashes).toBeCalledTimes(1)
      expect(ingestionProcessEntityService_saveHashes).toHaveBeenCalledWith({
        address: ingestionProcessMock.ingestionWorkflow.address,
        blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
        contractConfigurationId: null,
        data: traces.map((log) => ({ transactionHash: log.hash, blockNumber: Number.parseInt(log.blockNumber) }))
      })

      expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
      expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
        ...metadata,
        page: metadata.page + 1
      })
    })

    it('returns 0 traces', async () => {
      const traces = []
      etherscanAdapterMock_getTransactionInternalsByAddress.mockImplementation(() => {
        return Promise.resolve(traces)
      })

      await (evmNativeIngestionProcessCommand as any).pullAndSaveData(pullAndSaveDataParams)

      expect(etherscanAdapterMock_getTransactionInternalsByAddress).toBeCalledTimes(1)
      expect(etherscanAdapterMock_getTransactionInternalsByAddress).toHaveBeenCalledWith({
        address: ingestionProcessMock.ingestionWorkflow.address,
        fromBlock: metadata.fromBlock,
        page: metadata.page,
        offset: metadata.pageSize
      })

      expect(ingestionProcessEntityService_saveHashes).toBeCalledTimes(0)

      expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
      expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
        ...metadata,
        page: 1,
        traces: true
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

      const traces = getTraces()
      etherscanAdapterMock_getTransactionInternalsByAddress.mockImplementation(() => {
        return Promise.resolve(traces)
      })

      await (evmNativeIngestionProcessCommand as any).pullAndSaveData(newPullAndSaveDataParams)

      expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
      expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
        ...metadata,
        page: 1,
        tempBlock: Number.parseInt(traces[traces.length - 1].blockNumber) - 1
      })
    })

    it('success for tempBlock', async () => {
      const newMetadata: EvmNativeIngestionTaskMetadata = {
        ...metadata,
        page: 1,
        tempBlock: 98
      }
      const newPullAndSaveDataParams = {
        ...pullAndSaveDataParams,
        metadata: newMetadata
      }

      const traces = getTraces()
      etherscanAdapterMock_getTransactionInternalsByAddress.mockImplementation(() => {
        return Promise.resolve(traces)
      })

      await (evmNativeIngestionProcessCommand as any).pullAndSaveData(newPullAndSaveDataParams)

      expect(etherscanAdapterMock_getTransactionInternalsByAddress).toBeCalledTimes(1)
      expect(etherscanAdapterMock_getTransactionInternalsByAddress).toHaveBeenCalledWith({
        address: ingestionProcessMock.ingestionWorkflow.address,
        fromBlock: newMetadata.tempBlock,
        page: newMetadata.page,
        offset: newMetadata.pageSize
      })

      expect(ingestionProcessEntityService_saveHashes).toBeCalledTimes(1)
      expect(ingestionProcessEntityService_saveHashes).toHaveBeenCalledWith({
        address: ingestionProcessMock.ingestionWorkflow.address,
        blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
        contractConfigurationId: null,
        data: traces.map((log) => ({ transactionHash: log.hash, blockNumber: Number.parseInt(log.blockNumber) }))
      })

      expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
      expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
        ...newMetadata,
        page: newMetadata.page + 1
      })
    })
  })

  describe(`getHashesFromExternal tests`, () => {
    let ingestionProcessEntityService_saveHashes: jest.SpyInstance
    let ingestionProcessEntityService_next: jest.SpyInstance
    let etherscanAdapterMock_getTransactionExternals: jest.SpyInstance
    let ingestionDataProviderMock_saveTransactionDetails: jest.SpyInstance

    const ingestionProcessMock = ingestionProcessMocks.getNativeMock()
    let metadata: EvmNativeIngestionTaskMetadata
    let pullAndSaveDataParams: any

    beforeEach(async () => {
      ingestionProcessEntityService_saveHashes = jest
        .spyOn(evmNativeIngestionProcessCommand as any, 'saveHashes')
        .mockImplementation(() => Promise.resolve())

      ingestionProcessEntityService_next = jest
        .spyOn(evmNativeIngestionProcessCommand as any, 'next')
        .mockImplementation(() => Promise.resolve())

      etherscanAdapterMock_getTransactionExternals = jest.spyOn(etherscanAdapterMock as any, 'getTransactionExternals')
      ingestionDataProviderMock_saveTransactionDetails = jest.spyOn(
        ingestionDataProviderMock as any,
        'saveTransactionDetails'
      )

      ingestionProcessEntityService_saveHashes.mockClear()
      ingestionProcessEntityService_next.mockClear()
      etherscanAdapterMock_getTransactionExternals.mockClear()
      ingestionDataProviderMock_saveTransactionDetails.mockClear()

      metadata = {
        ...ingestionProcessMock.metadata,
        external: false,
        traces: true,
        saving: true
      } as EvmNativeIngestionTaskMetadata
      pullAndSaveDataParams = {
        ingestionProcess: ingestionProcessMock,
        blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
        address: ingestionProcessMock.ingestionWorkflow.address,
        metadata: metadata
      }
    })

    it('success for externals', async () => {
      const externals = getExternals()
      etherscanAdapterMock_getTransactionExternals.mockImplementation(() => {
        return Promise.resolve(externals)
      })

      await (evmNativeIngestionProcessCommand as any).pullAndSaveData(pullAndSaveDataParams)

      expect(etherscanAdapterMock_getTransactionExternals).toBeCalledTimes(1)
      expect(etherscanAdapterMock_getTransactionExternals).toHaveBeenCalledWith({
        address: ingestionProcessMock.ingestionWorkflow.address,
        fromBlock: metadata.fromBlock,
        page: metadata.page,
        offset: metadata.pageSize
      })

      expect(ingestionDataProviderMock_saveTransactionDetails).toBeCalledTimes(externals.length)

      expect(ingestionProcessEntityService_saveHashes).toBeCalledTimes(1)
      expect(ingestionProcessEntityService_saveHashes).toHaveBeenCalledWith({
        address: ingestionProcessMock.ingestionWorkflow.address,
        blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
        contractConfigurationId: null,
        data: externals.map((log) => ({ transactionHash: log.hash, blockNumber: Number.parseInt(log.blockNumber) }))
      })

      expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
      expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
        ...metadata,
        page: metadata.page + 1
      })
    })

    it('returns 0', async () => {
      const traces = []
      etherscanAdapterMock_getTransactionExternals.mockImplementation(() => {
        return Promise.resolve(traces)
      })

      await (evmNativeIngestionProcessCommand as any).pullAndSaveData(pullAndSaveDataParams)

      expect(etherscanAdapterMock_getTransactionExternals).toBeCalledTimes(1)
      expect(etherscanAdapterMock_getTransactionExternals).toHaveBeenCalledWith({
        address: ingestionProcessMock.ingestionWorkflow.address,
        fromBlock: metadata.fromBlock,
        page: metadata.page,
        offset: metadata.pageSize
      })

      expect(ingestionProcessEntityService_saveHashes).toBeCalledTimes(0)

      expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
      expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
        ...metadata,
        page: 1,
        external: true
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

      const traces = getTraces()
      etherscanAdapterMock_getTransactionExternals.mockImplementation(() => {
        return Promise.resolve(traces)
      })

      await (evmNativeIngestionProcessCommand as any).pullAndSaveData(newPullAndSaveDataParams)

      expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
      expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
        ...metadata,
        page: 1,
        tempBlock: Number.parseInt(traces[traces.length - 1].blockNumber) - 1
      })
    })

    it('success for tempBlock', async () => {
      const newMetadata: EvmNativeIngestionTaskMetadata = {
        ...metadata,
        page: 1,
        tempBlock: 98
      }
      const newPullAndSaveDataParams = {
        ...pullAndSaveDataParams,
        metadata: newMetadata
      }

      const traces = getTraces()
      etherscanAdapterMock_getTransactionExternals.mockImplementation(() => {
        return Promise.resolve(traces)
      })

      await (evmNativeIngestionProcessCommand as any).pullAndSaveData(newPullAndSaveDataParams)

      expect(etherscanAdapterMock_getTransactionExternals).toBeCalledTimes(1)
      expect(etherscanAdapterMock_getTransactionExternals).toHaveBeenCalledWith({
        address: ingestionProcessMock.ingestionWorkflow.address,
        fromBlock: newMetadata.tempBlock,
        page: newMetadata.page,
        offset: newMetadata.pageSize
      })

      expect(ingestionProcessEntityService_saveHashes).toBeCalledTimes(1)
      expect(ingestionProcessEntityService_saveHashes).toHaveBeenCalledWith({
        address: ingestionProcessMock.ingestionWorkflow.address,
        blockchainId: ingestionProcessMock.ingestionWorkflow.blockchainId,
        contractConfigurationId: null,
        data: traces.map((log) => ({ transactionHash: log.hash, blockNumber: Number.parseInt(log.blockNumber) }))
      })

      expect(ingestionProcessEntityService_next).toBeCalledTimes(1)
      expect(ingestionProcessEntityService_next).toHaveBeenCalledWith(ingestionProcessMock, {
        ...newMetadata,
        page: newMetadata.page + 1
      })
    })
  })
})
