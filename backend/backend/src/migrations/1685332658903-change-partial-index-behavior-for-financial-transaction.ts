import { MigrationInterface, QueryRunner } from 'typeorm'

export class changePartialIndexBehaviorForFinancialTransaction1685332658903 implements MigrationInterface {
  name = 'changePartialIndexBehaviorForFinancialTransaction1685332658903'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_financial_transaction_preprocess_uniqueId"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_financial_transaction_preprocess_uniqueId" ON "financial_transaction_preprocess" ("unique_id") WHERE "deleted_at" IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_financial_transaction_preprocess_uniqueId"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_financial_transaction_preprocess_uniqueId" ON "financial_transaction_preprocess" ("deleted_at", "unique_id") WHERE (deleted_at IS NOT NULL)`
    )
  }
}
