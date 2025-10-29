import { MigrationInterface, QueryRunner } from 'typeorm'

export class rootfiMigration1716535240583 implements MigrationInterface {
  name = 'rootfiMigration1716535240583'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_integration" ADD "platform" varchar`)
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" ADD "rootfi_org_id" bigint`)
    await queryRunner.query(`ALTER TABLE "integration" RENAME COLUMN "merge_id" TO "integration_id"`)
    // update platform to 'merge' for all xero and quickbooks
    await queryRunner.query(
      `UPDATE organization_integration SET platform = 'merge' where integration_name='xero' or integration_name='quickbooks'`
    )
    // drop current unique index of index UQ_conditional_organization_integration and UQ_chart_of_account_remoteId
    await queryRunner.query(`DROP INDEX "public"."UQ_conditional_organization_integration"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_chart_of_account_remoteId"`)

    // create new unique index for integration and organization with new condition
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_conditional_integration_organization" ON "organization_integration" ("integration_name", "organization_id") WHERE deleted_at is null AND platform is null`
    )
    // create unique index for platform also
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_conditional_integration_organization_platform" ON "organization_integration" ("integration_name", "organization_id", "platform") WHERE deleted_at is null AND platform is not null`
    )
    // add rootfi_id to chart_of_account table
    await queryRunner.query(`ALTER TABLE "chart_of_account" ADD "rootfi_id" VARCHAR`)
    // create unique index for remote_id and rootfi_id
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_chart_of_account_remoteId" ON "chart_of_account" ("remote_id") WHERE deleted_at is NULL AND rootfi_id IS NULL`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_chart_of_account_rootfiId" ON "chart_of_account" ("rootfi_id") WHERE deleted_at is NULL AND remote_id IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_integration" DROP COLUMN "platform"`)
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" DROP COLUMN "rootfi_org_id"`)
    await queryRunner.query(`ALTER TABLE "integration" RENAME COLUMN "integration_id" TO "merge_id"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_conditional_integration_organization"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_conditional_integration_organization_platform"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_chart_of_account_remoteId"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_chart_of_account_rootfiId"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_conditional_integration_organization" ON "organization_integration" ("integration_name", "organization_id") WHERE deleted_at is null`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_chart_of_account_remoteId" ON "chart_of_account" ("remote_id") WHERE deleted_at is NULL`
    )
  }
}
