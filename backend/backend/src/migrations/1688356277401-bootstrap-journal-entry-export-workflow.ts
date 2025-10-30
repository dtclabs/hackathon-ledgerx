import { MigrationInterface, QueryRunner } from 'typeorm'

const roles = ['Owner', 'Admin']
const resource = 'journal_entry_exports'
const actions = ['create', 'read']

export class bootstrapJournalEntryExportWorkflow1688356277401 implements MigrationInterface {
  name = 'bootstrapJournalEntryExportWorkflow1688356277401'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_organization_integration_integrationName_organizationId"`)
    await queryRunner.query(
      `CREATE TABLE "journal_entry_export_workflow" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "integration_name" character varying NOT NULL, "organization_id" character varying NOT NULL, "type" character varying NOT NULL, "status" character varying NOT NULL, "error" json, "requested_by" character varying, "last_executed_at" TIMESTAMP, "generated_at" TIMESTAMP, "exported_at" TIMESTAMP, "completed_at" TIMESTAMP, "metadata" json, CONSTRAINT "PK_e0080d6876ddbb0d3d2c3868193" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_organization_integration_integration_organization" ON "organization_integration" ("integration_name", "organization_id") `
    )

    for (const role of roles) {
      const roleSqlResult = await queryRunner.query(`SELECT id
                                                            FROM "role"
                                                            WHERE "name" = '${role}'`)
      for (const action of actions) {
        await queryRunner.query(
          `INSERT INTO "permission"("created_at", "updated_at", "deleted_at", "resource", "action", "role_id")
                                       VALUES (DEFAULT, DEFAULT, DEFAULT, '${resource}', '${action}', '${roleSqlResult[0].id}')`
        )
      }
    }
    await queryRunner.query(`insert into feature_flag (name, is_enabled) values ('xero_export', false)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from feature_flag where name = 'xero_export'`)
    await queryRunner.query(`DELETE FROM "permission" WHERE "resource" = '${resource}'`)
    await queryRunner.query(`DROP INDEX "public"."UQ_organization_integration_integration_organization"`)
    await queryRunner.query(`DROP TABLE "journal_entry_export_workflow"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_organization_integration_integrationName_organizationId" ON "organization_integration" ("integration_name", "organization_id") `
    )
  }
}
