import { MigrationInterface, QueryRunner } from 'typeorm'

export class cardOnboarding1719596476506 implements MigrationInterface {
  name = 'cardOnboarding1719596476506'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "onboarding" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "status" character varying NOT NULL, "type" character varying NOT NULL, "organization_id" bigint NOT NULL, CONSTRAINT "PK_b8b6cfe63674aaee17874f033cf" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_onboarding_org_id_type" ON "onboarding" ("organization_id", "type") `
    )
    await queryRunner.query(
      `CREATE TABLE "onboarding_step" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "type" character varying NOT NULL, "status" character varying NOT NULL, "metadata" json NOT NULL, "onboarding_id" bigint NOT NULL, CONSTRAINT "PK_f0cf055bfbabf8d3ae96885e8a3" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_onboarding_step_onboarding_id_type" ON "onboarding_step" ("onboarding_id", "type") `
    )
    await queryRunner.query(
      `ALTER TABLE "onboarding" ADD CONSTRAINT "FK_9d1e90a054c6ba6e6b511fd6dea" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "onboarding_step" ADD CONSTRAINT "FK_179e744784c3260c53e4127fbfb" FOREIGN KEY ("onboarding_id") REFERENCES "onboarding"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "onboarding_step" DROP CONSTRAINT "FK_179e744784c3260c53e4127fbfb"`)
    await queryRunner.query(`ALTER TABLE "onboarding" DROP CONSTRAINT "FK_9d1e90a054c6ba6e6b511fd6dea"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_onboarding_step_onboarding_id_type"`)
    await queryRunner.query(`DROP TABLE "onboarding_step"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_onboarding_org_id_type"`)
    await queryRunner.query(`DROP TABLE "onboarding"`)
  }
}
