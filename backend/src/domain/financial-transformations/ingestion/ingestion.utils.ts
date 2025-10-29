import { ContractConfiguration } from '../../../shared/entity-services/contract-configurations/contract-configuration.entity'
import { ContractConfigurationPlaceholderEnum } from '../../../shared/entity-services/contract-configurations/interfaces'
import { EvmLog } from '../../../shared/entity-services/ingestion/evm/evm-log.entity'
import { web3Helper } from '../../../shared/helpers/web3.helper'
import { isPolygonBlockchain } from '../../../shared/utils/utils'
import { EtherscanLog } from '../../block-explorers/etherscan/interfaces'

export const ingestionUtils = {
  isAddressTopic,
  isLogMatchConfiguration,
  isLogMatchEvmConfiguration,
  getAddressFromLog,
  isContractConfigurationIsEnabled
}

function isAddressTopic(topic: string | ContractConfigurationPlaceholderEnum) {
  return (
    topic === ContractConfigurationPlaceholderEnum.ADDRESS_IN ||
    topic === ContractConfigurationPlaceholderEnum.ADDRESS_OUT
  )
}

function isLogMatchConfiguration(params: {
  contractConfiguration: ContractConfiguration
  logTopic0?: string
  logTopic1?: string
  logTopic2?: string
  logTopic3?: string
}) {
  if (!!params.logTopic0 !== !!params.contractConfiguration.topic0) {
    return false
  }
  // Should match function signature
  if (!(params.logTopic0 === params.contractConfiguration.topic0)) {
    return false
  }

  if (
    !!params.logTopic1 !==
    !!(
      params.contractConfiguration.topic1 ||
      params.contractConfiguration.topic2 ||
      params.contractConfiguration.topic3
    )
  ) {
    return false
  }

  if (!!params.logTopic2 !== !!(params.contractConfiguration.topic2 || params.contractConfiguration.topic3)) {
    return false
  }

  if (!!params.logTopic3 !== !!params.contractConfiguration.topic3) {
    return false
  }

  return true
}

function isLogMatchEvmConfiguration(log: EvmLog, contractConfiguration: ContractConfiguration) {
  if (!!log.topic0 !== !!contractConfiguration.topic0) {
    return false
  }
  // Should match function signature
  if (!(log.topic0 === contractConfiguration.topic0)) {
    return false
  }

  if (
    !!log.topic1 !== !!(contractConfiguration.topic1 || contractConfiguration.topic2 || contractConfiguration.topic3)
  ) {
    return false
  }

  if (!!log.topic2 !== !!(contractConfiguration.topic2 || contractConfiguration.topic3)) {
    return false
  }

  if (!!log.topic3 !== !!contractConfiguration.topic3) {
    return false
  }

  return true
}

function getAddressFromLog(
  log: EtherscanLog,
  contractConfiguration: ContractConfiguration,
  direction: ContractConfigurationPlaceholderEnum
) {
  const doesMatch = isLogMatchConfiguration({
    contractConfiguration,
    logTopic0: log.topics?.[0],
    logTopic1: log.topics?.[1],
    logTopic2: log.topics?.[2],
    logTopic3: log.topics?.[3]
  })

  if (!doesMatch) {
    throw new Error(
      `Log does not match configuration ${contractConfiguration.id}  and log ${log.transactionHash}:${log.logIndex} `
    )
  }

  if (contractConfiguration.topic1 === direction) {
    return log.topics?.[1] ? web3Helper.fromDecodedAddress(log.topics[1]) : null
  }

  if (contractConfiguration.topic2 === direction) {
    return log.topics?.[2] ? web3Helper.fromDecodedAddress(log.topics[2]) : null
  }

  if (contractConfiguration.topic3 === direction) {
    return log.topics?.[3] ? web3Helper.fromDecodedAddress(log.topics[3]) : null
  }
}

function isContractConfigurationIsEnabled(
  contractConfiguration: ContractConfiguration,
  featureFlagsStatus: {
    isPolygonNewIngestionPreprocessStrategyEnabled: boolean
  }
) {
  // Polygon log transfer event.
  // It duplicates Matic native transfers and if we have contract configuration for this event,
  // we should change Polygon ingestion strategy as well
  // Added due this issue: https://app.clickup.com/t/865dawn8a
  if (
    isPolygonBlockchain(contractConfiguration.blockchainId) &&
    contractConfiguration.topic0 === '0xe6497e3ee548a3372136af2fcb0696db31fc6cf20260707645068bd3fe97f3c4'
  ) {
    return featureFlagsStatus.isPolygonNewIngestionPreprocessStrategyEnabled
  }
  return true
}
