import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../../../shared/logger/logger.service'
import { EvmscanDataProviderBase } from './evmscan-data-provider.base'
import { GnosisAddressTransactionsEntityService } from '../../../../shared/entity-services/ingestion/evm/gnosis/gnosis-address-transactions.entity.service'
import { GnosisReceiptsEntityService } from '../../../../shared/entity-services/ingestion/evm/gnosis/gnosis-receipts.entity.service'
import { GnosisLogsEntityService } from '../../../../shared/entity-services/ingestion/evm/gnosis/gnosis-logs.entity.service'
import { GnosisTracesEntityService } from '../../../../shared/entity-services/ingestion/evm/gnosis/gnosis-traces.entity.service'
import { GnosisTransactionDetailsEntityService } from '../../../../shared/entity-services/ingestion/evm/gnosis/gnosis-transaction-details.entity.service'
import { GnosisAddressTransaction } from '../../../../shared/entity-services/ingestion/evm/gnosis/gnosis-address-transaction.entity'
import { DeepPartial } from 'typeorm/common/DeepPartial'
import { GnosisCustomLogsEntityService } from '../../../../shared/entity-services/ingestion/evm/gnosis/gnosis-custom-logs.entity.service'
import { GnosisCustomLog } from '../../../../shared/entity-services/ingestion/evm/gnosis/gnosis-custom-log.entity'

@Injectable()
export class GnosisDataProviderService extends EvmscanDataProviderBase {
  constructor(
    protected readonly logger: LoggerService,
    protected readonly gnosisAddressTransactionsEntityService: GnosisAddressTransactionsEntityService,
    protected readonly gnosisReceiptsEntityService: GnosisReceiptsEntityService,
    protected readonly gnosisLogsEntityService: GnosisLogsEntityService,
    protected readonly gnosisTracesEntityService: GnosisTracesEntityService,
    protected readonly gnosisTransactionDetailsEntityService: GnosisTransactionDetailsEntityService,
    protected readonly gnosisCustomLogsEntityService: GnosisCustomLogsEntityService
  ) {
    super(
      logger,
      gnosisAddressTransactionsEntityService,
      gnosisReceiptsEntityService,
      gnosisLogsEntityService,
      gnosisTracesEntityService,
      gnosisTransactionDetailsEntityService
    )
  }

  async upsert(addressTransaction: DeepPartial<GnosisAddressTransaction>) {
    return this.gnosisAddressTransactionsEntityService.upsert(addressTransaction)
  }

  async upsertCustomLog(log: DeepPartial<GnosisCustomLog>) {
    return this.gnosisCustomLogsEntityService.upsert(log)
  }

  async getCustomLogs(transactionHash: string) {
    return this.gnosisCustomLogsEntityService.getByTransactionHash(transactionHash)
  }
}
