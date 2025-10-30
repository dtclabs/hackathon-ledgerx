import { MigrationInterface, QueryRunner } from 'typeorm'

export class addIndexToFinancialTransactionChild1718084505654 implements MigrationInterface {
  name = 'addIndexToFinancialTransactionChild1718084505654'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_fin_txn_child_parent_id" ON "financial_transaction_child" ("financial_transaction_parent_id") WHERE "deleted_at" IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_fin_txn_child_parent_id"`)
  }
}
