import { MigrationInterface, QueryRunner } from 'typeorm'

export class addQuickbooksToSubsciptionsAddons1696318523364 implements MigrationInterface {
  name = 'addQuickbooksToSubsciptionsAddons1696318523364'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    UPDATE subscription 
        SET organization_integration_add_ons = '{"xero":true,"request_finance":true,"quickbooks":true}'::json
    WHERE
        organization_integration_add_ons->>'quickbooks' IS NULL
        AND	organization_integration_add_ons->>'xero' = 'true'
        AND	organization_integration_add_ons->>'request_finance' = 'true'
        AND subscription_plan_id IN (
            SELECT id 
            FROM subscription_plan
            WHERE name = 'free_trial')
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    UPDATE subscription 
        SET organization_integration_add_ons = (replace(organization_integration_add_ons,'"quickbooks":true','"quickbooks":false'))::json
    WHERE
	    organization_integration_add_ons->>'quickbooks' = 'true'`)
  }
}
