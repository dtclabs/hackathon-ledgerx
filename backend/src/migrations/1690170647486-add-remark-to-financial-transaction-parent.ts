import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRemarkToFinancialTransactionParent1690170647486 implements MigrationInterface {
  name = 'addRemarkToFinancialTransactionParent1690170647486'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_chart_of_account_remoteId"`)
    await queryRunner.query(`ALTER TABLE "financial_transaction_parent" ADD "remark" character varying`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_chart_of_account_remoteId" ON "chart_of_account" ("remote_id") WHERE "deleted_at" IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_chart_of_account_remoteId"`)
    await queryRunner.query(`ALTER TABLE "financial_transaction_parent" DROP COLUMN "remark"`)
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_chart_of_account_remoteId" ON "chart_of_account" ("remote_id") `)
  }
}
