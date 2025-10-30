import { MigrationInterface, QueryRunner } from 'typeorm'

export class addedWalletIdColumnForTempTransactions1688353201678 implements MigrationInterface {
  name = 'addedWalletIdColumnForTempTransactions1688353201678'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "temp_transactions_entity" ADD "wallet_address" character varying`)
    await queryRunner.query(
      `CREATE INDEX "IDX_temp_transactions_entity_migrated_at" ON "temp_transactions_entity" ("migrated_at") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_temp_transactions_entity_migrated_at"`)
    await queryRunner.query(`ALTER TABLE "temp_transactions_entity" DROP COLUMN "wallet_address"`)
  }
}
