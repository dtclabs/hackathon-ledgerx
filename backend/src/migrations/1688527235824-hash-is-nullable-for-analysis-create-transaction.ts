import { MigrationInterface, QueryRunner } from 'typeorm'

export class hashIsNullableForAnalysisCreateTransaction1688527235824 implements MigrationInterface {
  name = 'hashIsNullableForAnalysisCreateTransaction1688527235824'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "analysis_create_transaction" ALTER COLUMN "hash" DROP NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "analysis_create_transaction" ALTER COLUMN "hash" SET NOT NULL`)
  }
}
