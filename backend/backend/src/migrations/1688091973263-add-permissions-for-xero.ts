import { MigrationInterface, QueryRunner } from 'typeorm'

const roles = ['Owner', 'Admin']
const resources = [
  'organization_integrations',
  'integration_whitelist_requests',
  'chart_of_accounts',
  'chart_of_account_mappings'
]
const actions = ['create', 'read', 'update', 'delete']

export class addPermissionsForXero1688091973263 implements MigrationInterface {
  name = 'addPermissionsForXero1688091973263'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "permission" ALTER COLUMN "resource" TYPE VARCHAR USING resource::varchar`)
    await queryRunner.query(`DROP TYPE "public"."permission_resource_enum"`)
    await queryRunner.query(`ALTER TABLE "permission" ALTER COLUMN "action" TYPE VARCHAR USING action::varchar`)
    await queryRunner.query(`DROP TYPE "public"."permission_action_enum"`)

    for (const role of roles) {
      const roleSqlResult = await queryRunner.query(`SELECT id
                                                  FROM "role"
                                                  WHERE "name" = '${role}'`)
      for (const resource of resources) {
        for (const action of actions) {
          await queryRunner.query(
            `INSERT INTO "permission"("created_at", "updated_at", "deleted_at", "resource", "action", "role_id")
                             VALUES (DEFAULT, DEFAULT, DEFAULT, '${resource}', '${action}', '${roleSqlResult[0].id}')`
          )
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const resource of resources) {
      await queryRunner.query(`DELETE FROM "permission" WHERE "resource" = '${resource}'`)
    }
    await queryRunner.query(
      `CREATE TYPE "public"."permission_resource_enum" AS ENUM('source_of_funds', 'transactions', 'transfers', 'invitations', 'recipients', 'categories', 'members', 'payment_links', 'financial_transactions', 'wallets', 'wallet_groups', 'assets', 'cryptocurrencies', 'settings', 'organizations', 'organization_integrations', 'integration_whitelist_requests', 'chart_of_accounts', 'chart_of_account_mappings')`
    )
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "resource" TYPE "public"."permission_resource_enum" USING "resource"::"text"::"public"."permission_resource_enum"`
    )

    await queryRunner.query(
      `CREATE TYPE "public"."permission_action_enum" AS ENUM('create', 'read', 'update', 'delete')`
    )
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "action" TYPE "public"."permission_action_enum" USING "action"::"text"::"public"."permission_action_enum"`
    )
  }
}
