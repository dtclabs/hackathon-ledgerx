import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRequestFinanceToFreeTrialSubscriptions1693380752875 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `update
          subscription set
          organization_integration_add_ons = '{"xero":true, "request_finance":true}'::json
      where
          organization_integration_add_ons is null
          and subscription_plan_id in (
          select
              id
          from
              subscription_plan
          where
              name = 'free_trial')`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
