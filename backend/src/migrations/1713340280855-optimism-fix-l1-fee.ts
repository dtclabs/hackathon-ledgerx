import { MigrationInterface, QueryRunner } from 'typeorm'

export class optimismFixL1Fee1713340280855 implements MigrationInterface {
  name = 'optimismFixL1Fee1713340280855'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "optimism_receipt" ALTER COLUMN "l1_fee" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "optimism_receipt" ALTER COLUMN "l1_gas_price" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "optimism_receipt" ALTER COLUMN "l1_gas_used" DROP NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "optimism_receipt" ALTER COLUMN "l1_gas_used" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "optimism_receipt" ALTER COLUMN "l1_gas_price" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "optimism_receipt" ALTER COLUMN "l1_fee" SET NOT NULL`)
  }
}
