import { MigrationInterface, QueryRunner } from 'typeorm'

export class modifySourceIdNullableOnInvoiceTable1695022345657 implements MigrationInterface {
  name = 'modifySourceIdNullableOnInvoiceTable1695022345657'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "source_id" DROP NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "source_id" SET NOT NULL`)
  }
}
