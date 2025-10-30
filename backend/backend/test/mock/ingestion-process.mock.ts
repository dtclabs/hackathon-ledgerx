import { IngestionProcess } from '../../src/shared/entity-services/ingestion-process/ingestion-process.entity'
import { BlockExplorersProviderEnum } from '../../src/domain/block-explorers/block-explorers-provider.enum'
import { TaskStatusEnum, TaskSyncType } from '../../src/core/events/event-types'
import {
  EvmNativeIngestionTaskMetadata,
  IngestionProcessTypeEnum
} from '../../src/shared/entity-services/ingestion-process/interfaces'
import { ContractConfigurationPlaceholderEnum } from '../../src/shared/entity-services/contract-configurations/interfaces'
import { ContractConfiguration } from '../../src/shared/entity-services/contract-configurations/contract-configuration.entity'

export const ingestionProcessMocks = {
  getContractConfigurationMock,
  getNativeMock
}

type ContractConfigurationMockType = 'transfer' | 'deposit' | 'withdrawal'

function getContractConfigurationMock(type: ContractConfigurationMockType): IngestionProcess {
  return {
    ingestionWorkflow: {
      id: '1',
      updatedAt: null,
      createdAt: null,
      deletedAt: null,
      metadata: null,
      address: '0x0000000000',
      blockchainId: 'ethereum',
      completedAt: null,
      error: null,
      lastExecutionAt: null,
      status: TaskStatusEnum.RUNNING,
      ingestionProcesses: [],
      amountProcessed: 0
    },
    contractConfiguration: contractConfiguration.getContractConfigurationMockByType(type),
    provider: BlockExplorersProviderEnum.ETHERSCAN,
    metadata: {
      fromBlock: null,
      tempBlock: null,
      logsTo: false,
      logsFrom: false,
      page: 1,
      pageSize: 1000
    },
    completedAt: null,
    createdAt: null,
    deletedAt: null,
    error: null,
    id: '1',
    status: TaskStatusEnum.RUNNING,
    type: IngestionProcessTypeEnum.CONTRACT_CONFIGURATION,
    lastExecutionAt: null,
    syncType: TaskSyncType.INCREMENTAL,
    updatedAt: null
  }
}
function getNativeMock(): IngestionProcess {
  return {
    ingestionWorkflow: {
      id: '1',
      updatedAt: null,
      createdAt: null,
      deletedAt: null,
      metadata: null,
      address: '0x0000000000',
      blockchainId: 'ethereum',
      completedAt: null,
      error: null,
      lastExecutionAt: null,
      status: TaskStatusEnum.RUNNING,
      ingestionProcesses: [],
      amountProcessed: 0
    },
    contractConfiguration: null,
    provider: BlockExplorersProviderEnum.ETHERSCAN,
    metadata: {
      fromBlock: null,
      tempBlock: null,
      external: false,
      traces: false,
      page: 1,
      pageSize: 1000
    } as EvmNativeIngestionTaskMetadata,
    completedAt: null,
    createdAt: null,
    deletedAt: null,
    error: null,
    id: '1',
    status: TaskStatusEnum.RUNNING,
    type: IngestionProcessTypeEnum.NATIVE_TRANSFERS,
    lastExecutionAt: null,
    syncType: TaskSyncType.INCREMENTAL,
    updatedAt: null
  }
}

export const contractConfiguration = {
  getContractConfigurationMockByType
}

function getContractConfigurationMockByType(type: ContractConfigurationMockType): ContractConfiguration {
  if (type === 'transfer') {
    return contractConfigurationTransferMock()
  }
}

function contractConfigurationTransferMock(): ContractConfiguration {
  return {
    id: '1',
    updatedAt: null,
    deletedAt: null,
    createdAt: null,
    topic0: '0x0000000',
    topic1: ContractConfigurationPlaceholderEnum.ADDRESS_OUT,
    topic2: ContractConfigurationPlaceholderEnum.ADDRESS_IN,
    topic3: null,
    metadata: null,
    blockchainId: 'ethereum',
    contractAddress: '0x0000000000',
    name: 'contract name'
  }
}
