import { MigrationInterface, QueryRunner } from 'typeorm'

export class createSubscriptionTable1692847652233 implements MigrationInterface {
  name = 'createSubscriptionTable1692847652233'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subscription" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "billing_cycle" character varying NOT NULL, "status" character varying NOT NULL, "started_at" TIMESTAMP NOT NULL, "expired_at" TIMESTAMP NOT NULL, "organization_id" bigint NOT NULL, "subscription_plan_id" bigint NOT NULL, CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_021014ae94ebac72c1c3d22229d" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_6458a5349fd0de39d5ed36129ef" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "subscription" DROP CONSTRAINT "FK_6458a5349fd0de39d5ed36129ef"`)
    await queryRunner.query(`ALTER TABLE "subscription" DROP CONSTRAINT "FK_021014ae94ebac72c1c3d22229d"`)
    await queryRunner.query(`DROP TABLE "subscription"`)
  }
}
