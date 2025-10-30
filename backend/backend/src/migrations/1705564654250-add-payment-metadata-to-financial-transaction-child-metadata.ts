import { MigrationInterface, QueryRunner } from 'typeorm'

export class addPaymentMetadataToFinancialTransactionChildMetadata1705564654250 implements MigrationInterface {
  name = 'addPaymentMetadataToFinancialTransactionChildMetadata1705564654250'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "financial_transaction_child_metadata" ADD "payment_metadata" json`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "financial_transaction_child_metadata" DROP COLUMN "payment_metadata"`)
  }
}
