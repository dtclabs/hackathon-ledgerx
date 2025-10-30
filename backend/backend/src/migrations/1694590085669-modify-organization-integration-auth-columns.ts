import { MigrationInterface, QueryRunner } from 'typeorm'

export class modifyOrganizationIntegrationAuthColumns1694590085669 implements MigrationInterface {
  name = 'modifyOrganizationIntegrationAuthColumns1694590085669'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" ALTER COLUMN "access_token" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" DROP COLUMN "metadata"`)
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" ADD "metadata" json`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" DROP COLUMN "metadata"`)
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" ADD "metadata" character varying`)
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" ALTER COLUMN "access_token" SET NOT NULL`)
  }
}
