import { MigrationInterface, QueryRunner } from 'typeorm'

export class createAnalysisEventTrackerTable1684206665908 implements MigrationInterface {
  name = 'createAnalysisEventTrackerTable1684206665908'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_onboarding" RENAME COLUMN "organizationId" TO "organization_id"`)
    await queryRunner.query(
      `CREATE TABLE "analysis_event_tracker" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "eventType" character varying NOT NULL, "browser" character varying NOT NULL, "timezone" character varying NOT NULL, "location" character varying NOT NULL, "device" character varying NOT NULL, "url" character varying NOT NULL, "organizationId" character varying, "accountId" character varying, "traceId" character varying, "referrer_url" character varying, "metadata" json, CONSTRAINT "PK_c128a28f6562e81b314999ee6bf" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "analysis_event_tracker"`)
    await queryRunner.query(`ALTER TABLE "organization_onboarding" RENAME COLUMN "organization_id" TO "organizationId"`)
  }
}
