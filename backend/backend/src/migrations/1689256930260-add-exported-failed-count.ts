import { MigrationInterface, QueryRunner } from 'typeorm'

export class addExportedFailedCount1689256930260 implements MigrationInterface {
  name = 'addExportedFailedCount1689256930260'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_conditional_integration_organization"`)
    await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" ADD "exported_failed_count" integer`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_conditional_organization_integration" ON "organization_integration" ("organization_id", "integration_name") WHERE deleted_at is null`
    )

    await queryRunner.query(`INSERT INTO "integration" ("name", "merge_id","display_name","status")
        SELECT 'xero', 'xero', 'xero', 'enabled' WHERE NOT EXISTS ( SELECT 1 FROM "integration" WHERE name = 'xero')`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_conditional_organization_integration"`)
    await queryRunner.query(`ALTER TABLE "journal_entry_export_workflow" DROP COLUMN "exported_failed_count"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_conditional_integration_organization" ON "organization_integration" ("integration_name", "organization_id") WHERE (deleted_at IS NULL)`
    )
  }
}
