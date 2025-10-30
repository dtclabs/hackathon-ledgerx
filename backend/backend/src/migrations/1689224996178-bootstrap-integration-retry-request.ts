import { MigrationInterface, QueryRunner } from 'typeorm'

export class bootstrapIntegrationRetryRequest1689224996178 implements MigrationInterface {
  name = 'bootstrapIntegrationRetryRequest1689224996178'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "integration_retry_request" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "retry_count" integer, "retry_at" TIMESTAMP, "integration_name" character varying, "organization_id" bigint, CONSTRAINT "PK_dd4ea0e06cec7a649988b6ebd55" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "integration_retry_request" ADD CONSTRAINT "FK_ae330ba062e1cd559fbfea4d400" FOREIGN KEY ("integration_name") REFERENCES "integration"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "integration_retry_request" ADD CONSTRAINT "FK_26254e3904df79dcaf6a39990f3" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )

    await queryRunner.query(`INSERT INTO "integration_retry_request" ("organization_id", "integration_name")
        SELECT "organization_id", "integration_name" from "organization_integration" where "deleted_at" is null and status in ('token_swapped', 'completed')`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "integration_retry_request" DROP CONSTRAINT "FK_26254e3904df79dcaf6a39990f3"`)
    await queryRunner.query(`ALTER TABLE "integration_retry_request" DROP CONSTRAINT "FK_ae330ba062e1cd559fbfea4d400"`)
    await queryRunner.query(`DROP TABLE "integration_retry_request"`)
  }
}
