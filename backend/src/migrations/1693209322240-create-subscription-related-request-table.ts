import { MigrationInterface, QueryRunner } from 'typeorm'

export class createSubscriptionRelatedRequestTable1693209322240 implements MigrationInterface {
  name = 'createSubscriptionRelatedRequestTable1693209322240'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subscription_related_request" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_id" character varying NOT NULL, "request_type" character varying NOT NULL, "contact_details" json, "request_details" json, CONSTRAINT "PK_eb875f46c3e2d7a07b30e0d42ed" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "subscription_related_request"`)
  }
}
