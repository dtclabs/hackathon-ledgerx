import { MigrationInterface, QueryRunner } from 'typeorm'

export class createPayoutTable1698734895349 implements MigrationInterface {
  name = 'createPayoutTable1698734895349'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payout" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blockchain_id" character varying NOT NULL, "type" character varying NOT NULL, "hash" character varying, "safe_hash" character varying, "metadata" json, "status" character varying NOT NULL, "line_items" json NOT NULL, "notes" character varying, "executed_at" TIMESTAMP, "synced_at" TIMESTAMP, "organization_id" bigint NOT NULL, "source_wallet_id" bigint NOT NULL, "created_by" bigint NOT NULL, "updated_by" bigint NOT NULL, "executed_by" bigint, CONSTRAINT "UQ_57654ab6e222b19121f83c32351" UNIQUE ("public_id"), CONSTRAINT "PK_1cb73ce021dc6618a3818b0a474" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_payout_organization" ON "payout" ("organization_id") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_payout_source_wallet" ON "payout" ("source_wallet_id") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "payout" ADD CONSTRAINT "FK_655c332d605e041520d6501db75" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "payout" ADD CONSTRAINT "FK_8184d1ab40ebaf37202eeda6fa1" FOREIGN KEY ("source_wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "payout" ADD CONSTRAINT "FK_bf365c899b7e99ca45d666b3987" FOREIGN KEY ("created_by") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "payout" ADD CONSTRAINT "FK_7a95ff11858875555f9dc169779" FOREIGN KEY ("updated_by") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "payout" ADD CONSTRAINT "FK_bc7b2877d3cbe91d3ce617867e9" FOREIGN KEY ("executed_by") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payout" DROP CONSTRAINT "FK_bc7b2877d3cbe91d3ce617867e9"`)
    await queryRunner.query(`ALTER TABLE "payout" DROP CONSTRAINT "FK_7a95ff11858875555f9dc169779"`)
    await queryRunner.query(`ALTER TABLE "payout" DROP CONSTRAINT "FK_bf365c899b7e99ca45d666b3987"`)
    await queryRunner.query(`ALTER TABLE "payout" DROP CONSTRAINT "FK_8184d1ab40ebaf37202eeda6fa1"`)
    await queryRunner.query(`ALTER TABLE "payout" DROP CONSTRAINT "FK_655c332d605e041520d6501db75"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_payout_source_wallet"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_payout_organization"`)
    await queryRunner.query(`DROP TABLE "payout"`)
  }
}
