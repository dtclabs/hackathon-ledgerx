import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRootfiAutoMigrateToFeatureFlag1716535333643 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "feature_flag" ("name", "is_enabled") VALUES ('enable_rootfi_migration', false)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "feature_flag" WHERE "name" = 'enable_rootfi_migration'`)
  }
}
