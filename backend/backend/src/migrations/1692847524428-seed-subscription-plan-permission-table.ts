import { MigrationInterface, QueryRunner } from 'typeorm'

const organizationPermissions = {
  starter: [
    {
      name: 'integrations'
    },
    {
      name: 'chart_of_accounts'
    },
    {
      name: 'recipients'
    },
    {
      name: 'members'
    },
    {
      name: 'wallets'
    },
    {
      name: 'wallet_groups'
    },
    {
      name: 'financial_transactions'
    },
    {
      name: 'transactions',
      restrictions: { limit: 10000 }
    },
    {
      name: 'assets'
    },
    {
      name: 'payment_links'
    },
    {
      name: 'invitations'
    }
  ],
  business: [
    {
      name: 'integrations',
      restrictions: { integrations: ['xero', 'request_finance'] }
    },
    {
      name: 'chart_of_accounts'
    },
    {
      name: 'recipients'
    },
    {
      name: 'members'
    },
    {
      name: 'wallets'
    },
    {
      name: 'wallet_groups'
    },
    {
      name: 'financial_transactions'
    },
    {
      name: 'transactions',
      restrictions: { limit: 10000 }
    },
    {
      name: 'assets'
    },
    {
      name: 'payment_links'
    },
    {
      name: 'invitations'
    }
  ],
  free_trial: [
    {
      name: 'integrations',
      restrictions: { integrations: ['xero', 'request_finance'] }
    },
    {
      name: 'chart_of_accounts'
    },
    {
      name: 'recipients'
    },
    {
      name: 'members'
    },
    {
      name: 'wallets'
    },
    {
      name: 'wallet_groups'
    },
    {
      name: 'financial_transactions'
    },
    {
      name: 'transactions',
      restrictions: { limit: 10000 }
    },
    {
      name: 'assets'
    },
    {
      name: 'payment_links'
    },
    {
      name: 'invitations'
    }
  ]
}

export class seedSubscriptionPlanPermissionTable1692847524428 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "subscription_plan_permission"')

    for (const [planName, permissions] of Object.entries(organizationPermissions)) {
      for (const permission of permissions) {
        if (permission.restrictions) {
          await queryRunner.query(
            `INSERT INTO "subscription_plan_permission"("subscription_plan_id", "name", "restrictions") VALUES ((SELECT id FROM subscription_plan WHERE name = '${planName}'), '${
              permission.name
            }', '${JSON.stringify(permission.restrictions)}')`
          )
        } else {
          await queryRunner.query(
            `INSERT INTO "subscription_plan_permission"("subscription_plan_id", "name") VALUES ((SELECT id FROM subscription_plan WHERE name = '${planName}'), '${permission.name}')`
          )
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "subscription_plan_permission"')
  }
}
