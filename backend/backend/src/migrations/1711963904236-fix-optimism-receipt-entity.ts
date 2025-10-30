import { MigrationInterface, QueryRunner } from 'typeorm'

export class fixOptimismReceiptEntity1711963904236 implements MigrationInterface {
  name = 'fixOptimismReceiptEntity1711963904236'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "optimism_receipt" ALTER COLUMN "l1_fee_scalar" DROP NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "optimism_receipt" ALTER COLUMN "l1_fee_scalar" SET NOT NULL`)
  }
}
