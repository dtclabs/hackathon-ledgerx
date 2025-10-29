import { MigrationInterface, QueryRunner } from 'typeorm'

const planNames = ['free_trial', 'starter', 'business']

export class seedSubscriptionPlanTable1692672988326 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "subscription_plan"')

    for (const planName of planNames) {
      await queryRunner.query(`INSERT INTO "subscription_plan"("name") VALUES ('${planName}')`)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "subscription_plan"')
  }
}
