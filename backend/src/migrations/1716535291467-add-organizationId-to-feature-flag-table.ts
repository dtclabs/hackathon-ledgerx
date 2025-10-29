import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddOrganizationIDToFeatureFlagTable1716535291467 implements MigrationInterface {
  name = 'AddOrganizationIDToFeatureFlagTable1716535291467'
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE feature_flag ADD COLUMN organization_id varchar`)
    // drop current index
    await queryRunner.query(`alter table feature_flag drop constraint "UQ_feature_flag_name";`)
    // create another condition index
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_conditional_feature_flag_name" ON "feature_flag" ("name")  WHERE deleted_at is null AND organization_id is null`
    )
    // create condition unique index for name,organizationId also
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_conditional_feature_flag_name_organization_id" ON "feature_flag" ("name", "organization_id") WHERE deleted_at is null AND organization_id is not null`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE feature_flag DROP COLUMN organization_id`)
    await queryRunner.query(
      `alter table feature_flag drop constraint "UQ_conditional_feature_flag_name_organization_id" ON "feature_flag"`
    )
    await queryRunner.query(`DROP INDEX "public"."UQ_conditional_feature_flag_name";`)
    await queryRunner.query(`ALTER TABLE feature_flag ADD CONSTRAINT "UQ_feature_flag_name" UNIQUE ("name")`)
  }
}
