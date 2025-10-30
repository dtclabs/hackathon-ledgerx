import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, IsNull, Repository } from 'typeorm'
import { BaseEntityService } from '../base.entity-service'
import { WalletContractConfigurationLog } from './wallet-contract-configuration-log.entity'
import { dateHelper } from '../../helpers/date.helper'

@Injectable()
export class WalletContractConfigurationLogsEntityService extends BaseEntityService<WalletContractConfigurationLog> {
  constructor(
    @InjectRepository(WalletContractConfigurationLog)
    private walletContractConfigurationLogRepository: Repository<WalletContractConfigurationLog>
  ) {
    super(walletContractConfigurationLogRepository)
  }

  async getLatestBlock(params: { address: string; contractConfigurationId: string }) {
    const entity = await this.findOne({
      where: {
        address: params.address,
        contractConfiguration: {
          id: params.contractConfigurationId
        }
      },
      order: {
        evmLog: {
          blockNumber: 'DESC'
        }
      },
      relations: {
        evmLog: true
      }
    })

    return entity?.evmLog.blockNumber ?? null
  }

  async upsert(walletContractConfigurationLog: WalletContractConfigurationLog) {
    await this.walletContractConfigurationLogRepository.upsert(walletContractConfigurationLog, {
      skipUpdateIfNoValuesChanged: true,
      conflictPaths: ['contractConfiguration', 'evmLog', 'address']
    })
    return this.walletContractConfigurationLogRepository.findOne({
      where: {
        contractConfiguration: walletContractConfigurationLog.contractConfiguration,
        evmLog: walletContractConfigurationLog.evmLog,
        address: walletContractConfigurationLog.address
      }
    })
  }

  async getAllNotProcessedByConfiguration(params: { address: string; contractConfigurationId: string }) {
    return this.find({
      where: {
        address: params.address,
        processedAt: IsNull(),
        contractConfiguration: {
          id: params.contractConfigurationId
        }
      },
      relations: {
        evmLog: true,
        contractConfiguration: true
      }
    })
  }

  async markAsProcessed(entityId: string) {
    return this.walletContractConfigurationLogRepository.update(entityId, {
      processedAt: dateHelper.getUTCTimestamp()
    })
  }

  async markAsNotProcessedForAddress(address: string) {
    return this.walletContractConfigurationLogRepository.update(
      {
        address
      },
      {
        processedAt: null
      }
    )
  }

  async getNonProcessedForAddress(address: string, txHashes: string[]) {
    return this.find({
      where: {
        address,
        evmLog: {
          transactionHash: In(txHashes)
        }
      },
      relations: {
        evmLog: true,
        contractConfiguration: true
      }
    })
  }
}
