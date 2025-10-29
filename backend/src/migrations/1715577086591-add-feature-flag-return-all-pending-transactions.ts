import { MigrationInterface, QueryRunner } from 'typeorm'

export class addFeatureFlagReturnAllPendingTransactions1715577086591 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "feature_flag" ("name", "is_enabled") VALUES ('return_all_pending_transactions', false)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE
                             FROM "feature_flag"
                             WHERE "name" = 'return_all_pending_transactions'`)
  }
}
