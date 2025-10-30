import { MigrationInterface, QueryRunner } from 'typeorm'

export class addPaymentsSubscriptionPlanPermission1704868797132 implements MigrationInterface {
  name = 'addPaymentsSubscriptionPlanPermission1704868797132'

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const plan of ['starter', 'business', 'free_trial']) {
      await queryRunner.query(
        `INSERT INTO "subscription_plan_permission"("name", "subscription_plan_id")
                                       VALUES ('payments', (SELECT id FROM subscription_plan WHERE name = '${plan}'))`
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "subscription_plan_permission" WHERE name = 'payments'`)
  }
}
