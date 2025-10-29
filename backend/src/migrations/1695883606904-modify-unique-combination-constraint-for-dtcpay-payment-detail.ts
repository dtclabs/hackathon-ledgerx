import { MigrationInterface, QueryRunner } from 'typeorm'

export class modifyUniqueCombinationConstraintForDtcpayPaymentDetail1695883606904 implements MigrationInterface {
  name = 'modifyUniqueCombinationConstraintForDtcpayPaymentDetail1695883606904'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dtcpay_payment_detail" DROP CONSTRAINT "UQ_transaction_id_organization_id"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_transaction_id_organization_id" ON "dtcpay_payment_detail" ("transaction_id", "organization_id") WHERE deleted_at IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_transaction_id_organization_id"`)
    await queryRunner.query(
      `ALTER TABLE "dtcpay_payment_detail" ADD CONSTRAINT "UQ_transaction_id_organization_id" UNIQUE ("organization_id", "transaction_id")`
    )
  }
}
