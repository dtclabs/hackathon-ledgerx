import { MigrationInterface, QueryRunner } from 'typeorm'

const roles = ['Owner', 'Admin']
const resource = 'bank_feed_exports'
const actions = ['create', 'read']

export class addBankFeedExports1697513745341 implements MigrationInterface {
  name = 'addBankFeedExports1697513745341'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bank_feed_export_workflow" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" character varying NOT NULL, "name" character varying NOT NULL, "status" character varying NOT NULL, "integration_name" character varying NOT NULL, "error" json, "requested_by" character varying, "total_count" integer, "last_executed_at" TIMESTAMP, "completed_at" TIMESTAMP, "s3_file_path" character varying, "filename" character varying, "file_type" character varying NOT NULL, "metadata" json NOT NULL, CONSTRAINT "UQ_9932358b6db8a3bba8daf8ee256" UNIQUE ("public_id"), CONSTRAINT "PK_7818fa8e4563569587c105921e0" PRIMARY KEY ("id"))`
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
    await queryRunner.query(`DROP TABLE "bank_feed_export_workflow"`)
  }
}
