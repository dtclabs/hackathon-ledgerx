import { MigrationInterface, QueryRunner } from 'typeorm'

export class appendQuickbooksIntegrationToSubscriptionPlanPermission1697010984652 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `update
            subscription_plan_permission
        set
            restrictions = CONCAT('{"integrations":',
            (
                (restrictions->'integrations')::jsonb || '["quickbooks"]'::jsonb),'}'
            )::json
        where
            subscription_plan_id in (
                select
                    id
                from
                    subscription_plan
                where
                    name in ('free_trial', 'business')
            )
        and name = 'integrations'
        and (restrictions->'integrations')::text not ilike '%quickbooks%'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `update
	        subscription_plan_permission
        set
	        restrictions = (jsonb_set(restrictions::jsonb, '{integrations}', (restrictions->'integrations')::jsonb - 'quickbooks'::text))::json
        where
	        subscription_plan_id in (
	            select
		            id
	            from
		            subscription_plan
	            where
		            name in ('free_trial', 'business')
            )
	    and name = 'integrations'
	    and (restrictions->'integrations')::text ilike '%quickbooks%'`
    )
  }
}
