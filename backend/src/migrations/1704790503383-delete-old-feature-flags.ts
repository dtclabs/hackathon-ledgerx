import { MigrationInterface, QueryRunner } from 'typeorm'

export class deleteOldFeatureFlags1704790503383 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from feature_flag where name = 'financial_transaction'`)
    await queryRunner.query(`delete from feature_flag where name = 'evm_logs_parser'`)
    await queryRunner.query(`delete from feature_flag where name = 'wallet_blockchain_configuration'`)
    await queryRunner.query(`delete from feature_flag where name = 'financial_transaction_migration'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`insert into feature_flag (name, is_enabled) values ('financial_transaction', false)`)
    await queryRunner.query(`insert into feature_flag (name, is_enabled) values ('evm_logs_parser', false)`)
    await queryRunner.query(
      `insert into feature_flag (name, is_enabled) values ('wallet_blockchain_configuration', false)`
    )
    await queryRunner.query(
      `insert into feature_flag (name, is_enabled) values ('financial_transaction_migration', false)`
    )
  }
}
