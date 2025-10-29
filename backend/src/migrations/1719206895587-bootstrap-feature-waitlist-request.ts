import { MigrationInterface, QueryRunner } from 'typeorm'

export class bootstrapFeatureWaitlistRequest1719206895587 implements MigrationInterface {
  name = 'bootstrapFeatureWaitlistRequest1719206895587'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "feature_waitlist_request" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "requested_by" character varying NOT NULL, "contact_email" character varying NOT NULL, "feature_name" character varying NOT NULL, "organization_id" character varying NOT NULL, "comment" character varying, CONSTRAINT "PK_c0d3d50e99aa01586ec28c0cbd0" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "feature_waitlist_request"`)
  }
}
