import { MigrationInterface, QueryRunner } from 'typeorm'

export class refineJournalEntryExport1688467166520 implements MigrationInterface {
  name = 'refineJournalEntryExport1688467166520'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "financial_transaction_parent" ADD "export_status" character varying`)
    await queryRunner.query(`UPDATE "financial_transaction_parent" SET "export_status" = 'unexported'`)
    await queryRunner.query(`ALTER TABLE "financial_transaction_parent" ALTER COLUMN "export_status" SET NOT NULL`)

    await queryRunner.query(`ALTER TABLE "financial_transaction_parent" ADD "export_status_reason" character varying`)
    await queryRunner.query(`ALTER TABLE "journal_line" ADD "entry_type" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "journal_line" DROP COLUMN "net_amount"`)
    await queryRunner.query(`ALTER TABLE "journal_line" ADD "net_amount" character varying NOT NULL`)
    await queryRunner.query(
      `CREATE INDEX "IDX_financial_transaction_parent_organizationId_exportStatus" ON "financial_transaction_parent" ("organization_id", "export_status") WHERE "deleted_at" IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_financial_transaction_parent_organizationId_exportStatus"`)
    await queryRunner.query(`ALTER TABLE "journal_line" DROP COLUMN "net_amount"`)
    await queryRunner.query(`ALTER TABLE "journal_line" ADD "net_amount" integer NOT NULL`)
    await queryRunner.query(`ALTER TABLE "journal_line" DROP COLUMN "entry_type"`)
    await queryRunner.query(`ALTER TABLE "financial_transaction_parent" DROP COLUMN "export_status_reason"`)
    await queryRunner.query(`ALTER TABLE "financial_transaction_parent" DROP COLUMN "export_status"`)
  }
}
