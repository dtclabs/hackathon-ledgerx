import { MigrationInterface, QueryRunner } from 'typeorm'

export class setPlaceholderForCorrespondingCoaUpdatedBy1690878649985 implements MigrationInterface {
  name = 'setPlaceholderForCorrespondingCoaUpdatedBy1690878649985'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "financial_transaction_child_metadata" SET "corresponding_coa_updated_by" = 'account_migration' WHERE "deleted_at" IS NULL and "corresponding_coa_id" IS NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "financial_transaction_child_metadata" SET "corresponding_coa_updated_by" = null WHERE "corresponding_coa_updated_by" = 'account_migration';`
    )
  }
}
