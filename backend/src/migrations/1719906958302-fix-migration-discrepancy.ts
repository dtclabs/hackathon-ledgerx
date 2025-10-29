import { MigrationInterface, QueryRunner } from 'typeorm'

export class fixMigrationDiscrepancy1719906958302 implements MigrationInterface {
  name = 'fixMigrationDiscrepancy1719906958302'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_conditional_feature_flag_name"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_conditional_integration_organization"`)
    await queryRunner.query(
      `ALTER TABLE organization_integration_auth ALTER COLUMN rootfi_org_id TYPE integer USING rootfi_org_id::integer;`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_feature_flag_name" ON "feature_flag" ("name") WHERE "deleted_at" IS NULL AND "organization_id" IS NULL`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_conditional_organization_integration" ON "organization_integration" ("organization_id", "integration_name") WHERE deleted_at is null AND platform is null`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_conditional_organization_integration"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_feature_flag_name"`)
    await queryRunner.query(
      `ALTER TABLE organization_integration_auth ALTER COLUMN rootfi_org_id TYPE bigint USING rootfi_org_id::bigint;`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_conditional_integration_organization" ON "organization_integration" ("integration_name", "organization_id") WHERE ((deleted_at IS NULL) AND (platform IS NULL))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_conditional_feature_flag_name" ON "feature_flag" ("name") WHERE ((deleted_at IS NULL) AND (organization_id IS NULL))`
    )
  }
}
