import { MigrationInterface, QueryRunner } from 'typeorm'

export class modifyInvoiceColumnsNullable1694599046966 implements MigrationInterface {
  name = 'modifyInvoiceColumnsNullable1694599046966'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "from_metadata" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "to_metadata" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "invoice_details" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "counterpartyName" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "counterpartyEmail" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "items" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "view_url" DROP NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "view_url" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "items" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "counterpartyEmail" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "counterpartyName" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "invoice_details" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "to_metadata" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "from_metadata" DROP NOT NULL`)
  }
}
