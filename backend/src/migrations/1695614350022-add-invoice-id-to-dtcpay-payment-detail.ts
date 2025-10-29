import { MigrationInterface, QueryRunner } from 'typeorm'

export class addInvoiceIdToDtcpayPaymentDetail1695614350022 implements MigrationInterface {
  name = 'addInvoiceIdToDtcpayPaymentDetail1695614350022'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dtcpay_payment_detail" ADD "invoice_id" bigint`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "dtcpay_payment_detail" DROP COLUMN "invoice_id"`)
  }
}
