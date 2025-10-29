import { MigrationInterface, QueryRunner } from 'typeorm'

export class addOrganizationIntegrationAddOnsToSubscription1693366217990 implements MigrationInterface {
  name = 'addOrganizationIntegrationAddOnsToSubscription1693366217990'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "subscription" ADD "organization_integration_add_ons" json`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "subscription" DROP COLUMN "organization_integration_add_ons"`)
  }
}
