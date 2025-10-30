import { MigrationInterface, QueryRunner } from 'typeorm'

export class createOrgOnboardingTable1684123946907 implements MigrationInterface {
  name = 'createOrgOnboardingTable1684123946907'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organization_onboarding" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organizationId" character varying NOT NULL, "contact" jsonb NOT NULL, "job_title" character varying, CONSTRAINT "PK_4023aaf0a683aa1fac28cfb4a47" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organization_onboarding"`)
  }
}
