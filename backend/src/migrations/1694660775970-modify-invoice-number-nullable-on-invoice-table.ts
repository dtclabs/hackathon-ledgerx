import { MigrationInterface, QueryRunner } from 'typeorm'

export class modifyInvoiceNumberNullableOnInvoiceTable1694660775970 implements MigrationInterface {
  name = 'modifyInvoiceNumberNullableOnInvoiceTable1694660775970'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "invoice_number" SET NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "invoice_number" DROP NOT NULL`)
  }
}
