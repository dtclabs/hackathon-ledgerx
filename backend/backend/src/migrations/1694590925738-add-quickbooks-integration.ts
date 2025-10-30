import { MigrationInterface, QueryRunner } from 'typeorm'

export class addQuickbooksIntegration1694590925738 implements MigrationInterface {
  name = 'addQuickbooksIntegration1694590925738'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chart_of_account" ALTER COLUMN "code" DROP NOT NULL`)
    await queryRunner.query(`INSERT INTO "integration" ("name", "merge_id","display_name","status")
        SELECT 'quickbooks', 'quickbooks-online', 'QuickBooks', 'enabled' WHERE NOT EXISTS ( SELECT 1 FROM "integration" WHERE name = 'quickbooks')`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chart_of_account" ALTER COLUMN "code" SET NOT NULL`)
    await queryRunner.query(`DELETE FROM "integration" WHERE "name"='quickbooks'`)
  }
}
