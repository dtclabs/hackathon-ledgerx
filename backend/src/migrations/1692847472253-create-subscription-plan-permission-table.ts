import { MigrationInterface, QueryRunner } from 'typeorm'

export class createSubscriptionPlanPermissionTable1692847472253 implements MigrationInterface {
  name = 'createSubscriptionPlanPermissionTable1692847472253'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subscription_plan_permission" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "restrictions" json, "subscription_plan_id" bigint NOT NULL, CONSTRAINT "UQ_subscription_plan_permission_plan_permission_name" UNIQUE ("subscription_plan_id", "name"), CONSTRAINT "PK_18f22c3223adda89c0c51183517" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_permission" ADD CONSTRAINT "FK_0c9fda481fef1a5337640b5b59e" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_permission" DROP CONSTRAINT "FK_0c9fda481fef1a5337640b5b59e"`
    )
    await queryRunner.query(`DROP TABLE "subscription_plan_permission"`)
  }
}
