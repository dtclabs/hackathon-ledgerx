import { MigrationInterface, QueryRunner } from 'typeorm'

export class updateAnalysisCreateTransactionToWalletId1684736957948 implements MigrationInterface {
  name = 'updateAnalysisCreateTransactionToWalletId1684736957948'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "analysis_create_transaction" RENAME COLUMN "from_wallet" TO "from_wallet_id"`)
    await queryRunner.query(`ALTER TABLE "analysis_create_transaction" DROP COLUMN "from_wallet_id"`)
    await queryRunner.query(`ALTER TABLE "analysis_create_transaction" ADD "from_wallet_id" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "analysis_create_transaction" DROP COLUMN "from_wallet_id"`)
    await queryRunner.query(`ALTER TABLE "analysis_create_transaction" ADD "from_wallet_id" json`)
    await queryRunner.query(`ALTER TABLE "analysis_create_transaction" RENAME COLUMN "from_wallet_id" TO "from_wallet"`)
  }
}
