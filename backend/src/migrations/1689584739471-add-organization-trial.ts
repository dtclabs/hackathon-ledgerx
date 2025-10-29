import { MigrationInterface, QueryRunner } from 'typeorm'

export class addOrganizationTrial1689584739471 implements MigrationInterface {
  name = 'addOrganizationTrial1689584739471'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organization_trial" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_id" character varying NOT NULL, "status" character varying NOT NULL, "expired_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_9023dfd49ad26c5a3798f8fd9a3" PRIMARY KEY ("id"))`
    )

    await queryRunner.query(`INSERT INTO "organization_trial" ("organization_id","status", "expired_at")
        SELECT id, 'free_trial', '2023-08-31 23:59:59.999' FROM organization WHERE deleted_at IS NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organization_trial"`)
  }
}
