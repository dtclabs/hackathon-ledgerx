import { MigrationInterface, QueryRunner } from 'typeorm'

export class migrateOrganizationTrials1693210976016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO subscription(organization_id, subscription_plan_id, status, billing_cycle, started_at, expired_at)
            SELECT 
                CAST (organization_id AS BIGINT), 
                (SELECT MAX(id) FROM subscription_plan WHERE name = 'free_trial'), 
                'active', 
                'not_applicable', 
                created_at, 
                expired_at 
            FROM organization_trial 
            WHERE CAST(organization_id AS bigint) NOT IN (
                SELECT organization_id FROM subscription WHERE subscription_plan_id IN (
                    SELECT MAX(id) FROM subscription_plan WHERE name = 'free_trial'
                )
            )`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
