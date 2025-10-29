import { MigrationInterface, QueryRunner } from 'typeorm'

export class migratePaymentProviders1715594765532 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE payment SET provider = 'hq' WHERE type = 'disperse' AND destination_currency_type = 'crypto'`
    )
    await queryRunner.query(
      `UPDATE payment SET provider = 'gnosis_safe' WHERE type = 'safe' AND destination_currency_type = 'crypto'`
    )
    await queryRunner.query(
      `UPDATE payment SET provider_status = 'completed' WHERE provider = 'hq' AND status IN ('executed', 'synced')`
    )
    await queryRunner.query(
      `UPDATE payment SET provider_status = 'completed' WHERE provider = 'gnosis_safe' AND status IN ('executed', 'synced') AND hash IS NOT NULL`
    )
    await queryRunner.query(
      `UPDATE payment SET provider_status = 'pending' WHERE provider = 'gnosis_safe' AND status IN ('executed', 'synced') AND hash IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE payment SET provider = NULL, provider_status = NULL WHERE provider IN ('hq', 'gnosis_safe')`
    )
  }
}
