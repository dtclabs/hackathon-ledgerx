import { MigrationInterface, QueryRunner } from 'typeorm'

export class conditionalCompositeIndexInOrganizationIntegration1688439524505 implements MigrationInterface {
  name = 'conditionalCompositeIndexInOrganizationIntegration1688439524505'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_organization_integration_integration_organization"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_conditional_integration_organization" ON "organization_integration" ("integration_name", "organization_id") WHERE deleted_at is null`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_conditional_integration_organization"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_organization_integration_integration_organization" ON "organization_integration" ("integration_name", "organization_id") `
    )
  }
}
