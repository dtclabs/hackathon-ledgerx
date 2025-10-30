import { MigrationInterface, QueryRunner } from 'typeorm'

export class createBillingHistoryTable1692852141640 implements MigrationInterface {
  name = 'createBillingHistoryTable1692852141640'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "billing_history" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "billing_currency" character varying NOT NULL, "billed_amount" character varying NOT NULL, "status" character varying NOT NULL, "paid_amount" character varying, "paid_at" TIMESTAMP, "payment_currency" character varying, "payment_method" character varying, "subscription_details" json, "invoice_metadata" json, "organization_id" bigint NOT NULL, CONSTRAINT "UQ_04ade20f72cc9ba7d69465d3ca6" UNIQUE ("public_id"), CONSTRAINT "PK_f20ec465d981591343fecb3c9e3" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "billing_history" ADD CONSTRAINT "FK_fecdca99ef5357153a6fc008a2c" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "billing_history" DROP CONSTRAINT "FK_fecdca99ef5357153a6fc008a2c"`)
    await queryRunner.query(`DROP TABLE "billing_history"`)
  }
}
