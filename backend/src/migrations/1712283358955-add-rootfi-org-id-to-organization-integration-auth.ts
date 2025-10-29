import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRootfiOrgIdToOrganizationIntegrationAuth1712283358955 implements MigrationInterface {
  name = 'addRootfiOrgIdToOrganizationIntegrationAuth1712283358955'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" ADD "rootfi_org_id" integer`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organization_integration_auth" DROP COLUMN "rootfi_org_id"`)
  }
}
