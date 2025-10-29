import { MigrationInterface, QueryRunner } from 'typeorm'

export class addInvoiceNumberToInvoice1694660545378 implements MigrationInterface {
  name = 'addInvoiceNumberToInvoice1694660545378'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" ADD "invoice_number" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "invoice_number"`)
  }
}
