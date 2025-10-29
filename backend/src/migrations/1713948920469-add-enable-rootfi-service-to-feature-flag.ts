import { MigrationInterface, QueryRunner } from 'typeorm'

export class addEnableRootfiServiceToFeatureFlag implements MigrationInterface {
  name = 'addEnableRootfiServiceToFeatureFlag1713948920469'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "feature_flag" ("name", "is_enabled") VALUES ('enable_rootfi_service', false)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "feature_flag" WHERE "name" = 'enable_rootfi_service'`)
  }
}
