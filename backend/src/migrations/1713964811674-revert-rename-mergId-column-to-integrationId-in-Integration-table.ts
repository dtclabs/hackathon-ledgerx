import { MigrationInterface, QueryRunner } from 'typeorm'

export class revertRenameMergIdColumnToIntegrationIdInIntegrationTable1713964811674 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "integration" RENAME COLUMN "integration_id" TO "merge_id"`)
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" DROP COLUMN "rootfi_org_id"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "integration" RENAME COLUMN "merge_id" TO "integration_id"`)
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" ADD "rootfi_org_id" integer`)
  }
}
