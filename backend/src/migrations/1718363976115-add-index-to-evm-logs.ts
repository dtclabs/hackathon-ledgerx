import { MigrationInterface, QueryRunner } from 'typeorm'

export class addIndexToEvmLogs1718363976115 implements MigrationInterface {
  name = 'addIndexToEvmLogs1718363976115'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_arbitrum_log_hash_to" ON "arbitrum_log" ("transaction_hash", "to_address") `
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_arbitrum_log_hash_from" ON "arbitrum_log" ("transaction_hash", "from_address") `
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_bsc_log_hash_to" ON "bsc_log" ("transaction_hash", "to_address") `
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_bsc_log_hash_from" ON "bsc_log" ("transaction_hash", "from_address") `
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_gnosis_log_hash_to" ON "gnosis_log" ("transaction_hash", "to_address") `
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_gnosis_log_hash_from" ON "gnosis_log" ("transaction_hash", "from_address") `
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_polygon_log_hash_to" ON "polygon_log" ("transaction_hash", "to_address") `
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_polygon_log_hash_from" ON "polygon_log" ("transaction_hash", "from_address") `
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_optimism_log_hash_to" ON "optimism_log" ("transaction_hash", "to_address") `
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_optimism_log_hash_from" ON "optimism_log" ("transaction_hash", "from_address") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_optimism_log_hash_from"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_optimism_log_hash_to"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_polygon_log_hash_from"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_polygon_log_hash_to"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_gnosis_log_hash_from"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_gnosis_log_hash_to"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_bsc_log_hash_from"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_bsc_log_hash_to"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_arbitrum_log_hash_from"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_arbitrum_log_hash_to"`)
  }
}
