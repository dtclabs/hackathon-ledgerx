import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { BaseEntity } from '../../../core/entities/base.entity'
import { ContractConfiguration } from '../contract-configurations/contract-configuration.entity'
import { EvmLog } from '../evm-logs/evm-log.entity'

@Entity()
@Unique(['contractConfiguration', 'evmLog', 'address'])
export class WalletContractConfigurationLog extends BaseEntity {
  @ManyToOne(() => ContractConfiguration)
  @JoinColumn({ name: 'contract_configuration_id' })
  contractConfiguration: ContractConfiguration

  @ManyToOne(() => EvmLog)
  @JoinColumn({ name: 'evm_log_id' })
  evmLog: EvmLog

  @Column()
  address: string

  @Column({ name: 'processed_at', nullable: true })
  processedAt: Date

  static create(params: {
    contractConfiguration: ContractConfiguration
    evmLog: EvmLog
    address: string
  }): WalletContractConfigurationLog {
    const walletContractConfigurationLog = new WalletContractConfigurationLog()
    walletContractConfigurationLog.contractConfiguration = params.contractConfiguration
    walletContractConfigurationLog.evmLog = params.evmLog
    walletContractConfigurationLog.address = params.address
    return walletContractConfigurationLog
  }
}
