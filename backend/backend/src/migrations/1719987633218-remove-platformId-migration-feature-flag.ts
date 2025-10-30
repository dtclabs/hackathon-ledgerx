import { MigrationInterface, QueryRunner } from 'typeorm'

export class removePlatformIdMigrationFeatureFlag1719987633218 implements MigrationInterface {
  name = 'removePlatformIdMigrationFeatureFlag1719987633218'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "feature_flag" WHERE "name" = 'enable_platform_id_migration'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "feature_flag" ("name", "is_enabled") VALUES ('enable_platform_id_migration', false)`
    )
  }
}
