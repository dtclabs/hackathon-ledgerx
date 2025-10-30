import { MigrationInterface, QueryRunner } from 'typeorm'

const roles = ['Owner', 'Admin']
const resource = 'export_workflows'
const actions = ['create', 'read']
export class exportWorkflow1704692925337 implements MigrationInterface {
  name = 'exportWorkflow1704692925337'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "export_workflow"
                             (
                               "id"               BIGSERIAL         NOT NULL,
                               "created_at"       TIMESTAMP         NOT NULL DEFAULT now(),
                               "updated_at"       TIMESTAMP         NOT NULL DEFAULT now(),
                               "deleted_at"       TIMESTAMP,
                               "public_id"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
                               "organization_id"  character varying NOT NULL,
                               "type"             character varying NOT NULL,
                               "status"           character varying NOT NULL,
                               "error"            json,
                               "requested_by"     character varying,
                               "total_count"      integer,
                               "last_executed_at" TIMESTAMP,
                               "completed_at"     TIMESTAMP,
                               "s3_file_name"     character varying,
                               "name"             character varying NOT NULL,
                               "file_type"        character varying NOT NULL,
                               "public_metadata"  json,
                               "private_metadata" json,
                               CONSTRAINT "UQ_ee87a6f7a094bb72e65c328ef55" UNIQUE ("public_id"),
                               CONSTRAINT "PK_fe83a6ba7b46707bf090e22f152" PRIMARY KEY ("id")
                             )`)

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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "export_workflow"`)
    await queryRunner.query(`DELETE
                             FROM "permission"
                             WHERE "resource" = '${resource}'`)
  }
}
