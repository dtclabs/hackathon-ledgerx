import { MigrationInterface, QueryRunner } from 'typeorm'

export class addColumnsToInvoice1694598835831 implements MigrationInterface {
  name = 'addColumnsToInvoice1694598835831'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" ADD "source_metadata" json`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "status" character varying NOT NULL DEFAULT 'created'`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "from_metadata" json`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "to_metadata" json`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "invoice_details" json`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "issued_at" TIMESTAMP`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "expired_at" TIMESTAMP`)
    await queryRunner.query(`ALTER TABLE "invoice" ADD "due_at" TIMESTAMP`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "due_at"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "expired_at"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "issued_at"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "invoice_details"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "to_metadata"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "from_metadata"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "status"`)
    await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "source_metadata"`)
  }
}
