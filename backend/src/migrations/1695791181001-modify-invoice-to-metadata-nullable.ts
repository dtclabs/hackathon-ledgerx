import { MigrationInterface, QueryRunner } from 'typeorm'

export class modifyInvoiceToMetadataNullable1695791181001 implements MigrationInterface {
  name = 'modifyInvoiceToMetadataNullable1695791181001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "to_metadata" DROP NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "to_metadata" SET NOT NULL`)
  }
}
