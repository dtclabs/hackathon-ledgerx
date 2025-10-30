import { MigrationInterface, QueryRunner } from 'typeorm'

export class addTotalAmountToAnalysisCreatePayout1699259696899 implements MigrationInterface {
  name = 'addTotalAmountToAnalysisCreatePayout1699259696899'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "analysis_create_payout" ADD "total_amount" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "analysis_create_payout" DROP COLUMN "total_amount"`)
  }
}
