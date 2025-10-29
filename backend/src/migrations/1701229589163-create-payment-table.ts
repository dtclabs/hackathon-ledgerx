import { MigrationInterface, QueryRunner } from 'typeorm'

export class createPaymentTable1701229589163 implements MigrationInterface {
  name = 'createPaymentTable1701229589163'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payment" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blockchain_id" character varying, "type" character varying, "hash" character varying, "safe_hash" character varying, "destination_address" character varying NOT NULL, "destination_name" character varying, "destination_metadata" json, "amount" character varying, "fiat_value" character varying, "status" character varying NOT NULL, "chart_of_account_id" character varying, "notes" character varying, "remarks" character varying, "files" json, "metadata" json, "last_updated_at" TIMESTAMP, "reviewed_at" TIMESTAMP, "executed_at" TIMESTAMP, "failed_at" TIMESTAMP, "synced_at" TIMESTAMP, "organization_id" bigint NOT NULL, "source_wallet_id" bigint, "cryptocurrency_id" bigint, "reviewer_id" bigint, "created_by" bigint NOT NULL, "updated_by" bigint NOT NULL, "reviewed_by" bigint, "executed_by" bigint, CONSTRAINT "UQ_c174202a3de99ecc95f090da799" UNIQUE ("public_id"), CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_organization" ON "payment" ("organization_id") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_source_wallet" ON "payment" ("source_wallet_id") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_e5c51f0e7d2abede13ffd7e043d" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_da8ca2c6f7932f6ea0af6277b77" FOREIGN KEY ("source_wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_2ff814bc9a45a21653987d5fa87" FOREIGN KEY ("cryptocurrency_id") REFERENCES "cryptocurrency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_815f7dcbf4a78513b162f9f5202" FOREIGN KEY ("reviewer_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_e91eb2a79e0ca14007b6c3e4445" FOREIGN KEY ("created_by") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_467387bb999479d81e1b2933c46" FOREIGN KEY ("updated_by") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_ff46f3a4cb1a3f2e1f285675e60" FOREIGN KEY ("reviewed_by") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_3fbb8bbe94966d00d1cbe4631bc" FOREIGN KEY ("executed_by") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_3fbb8bbe94966d00d1cbe4631bc"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_ff46f3a4cb1a3f2e1f285675e60"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_467387bb999479d81e1b2933c46"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_e91eb2a79e0ca14007b6c3e4445"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_815f7dcbf4a78513b162f9f5202"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_2ff814bc9a45a21653987d5fa87"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_da8ca2c6f7932f6ea0af6277b77"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_e5c51f0e7d2abede13ffd7e043d"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_payment_source_wallet"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_payment_organization"`)
    await queryRunner.query(`DROP TABLE "payment"`)
  }
}
