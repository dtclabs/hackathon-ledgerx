import { MigrationInterface, QueryRunner } from 'typeorm'

export class createDtcpayPaymentDetailTable1695177806429 implements MigrationInterface {
  name = 'createDtcpayPaymentDetailTable1695177806429'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dtcpay_payment_detail" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_id" bigint NOT NULL, "transaction_id" character varying NOT NULL, "state" integer, "reference_no" character varying, "request_currency" character varying, "processing_amount" character varying, "processing_currency" character varying, "dtc_timestamp" TIMESTAMP, "last_updated_time" TIMESTAMP, "raw_data" json NOT NULL, CONSTRAINT "UQ_transaction_id_organization_id" UNIQUE ("transaction_id", "organization_id"), CONSTRAINT "PK_56d1144eed183967657430c6f28" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dtcpay_payment_detail"`)
  }
}
