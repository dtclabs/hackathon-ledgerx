import { MigrationInterface, QueryRunner } from 'typeorm'

export class addCryptocurrencyIdToAnalysisCreateTransaction1684741427411 implements MigrationInterface {
  name = 'addCryptocurrencyIdToAnalysisCreateTransaction1684741427411'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "analysis_create_transaction" ADD "cryptocurrency_id" character varying NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "analysis_create_transaction" DROP COLUMN "cryptocurrency_id"`)
  }
}
