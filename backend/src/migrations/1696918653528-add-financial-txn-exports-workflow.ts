import { MigrationInterface, QueryRunner } from 'typeorm'

const roles = ['Owner', 'Admin']
const resource = 'financial_transaction_exports'
const actions = ['create', 'read']

export class addFinancialTxnExportsWorkflow1696918653528 implements MigrationInterface {
  name = 'addFinancialTxnExportsWorkflow1696918653528'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "financial_transaction_export_workflow" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" character varying NOT NULL, "type" character varying NOT NULL, "status" character varying NOT NULL, "error" json, "requested_by" character varying, "total_count" integer, "last_executed_at" TIMESTAMP, "completed_at" TIMESTAMP, "file_type" character varying NOT NULL, "s3_file_name" character varying, "metadata" json, CONSTRAINT "UQ_35fce97b5972f90db46f77fba43" UNIQUE ("public_id"), CONSTRAINT "PK_d78dbfb6dda1227e364b5cc621d" PRIMARY KEY ("id"))`
    )
    for (const role of roles) {
      const roleSqlResult = await queryRunner.query(`SELECT id FROM "role" WHERE "name" = '${role}'`)
      for (const action of actions) {
        await queryRunner.query(
          `INSERT INTO "permission"("created_at", "updated_at", "deleted_at", "resource", "action", "role_id")
                VALUES (DEFAULT, DEFAULT, DEFAULT, '${resource}', '${action}', '${roleSqlResult[0].id}')`
        )
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "permission" WHERE "resource" = '${resource}'`)
    await queryRunner.query(`DROP TABLE "financial_transaction_export_workflow"`)
  }
}
