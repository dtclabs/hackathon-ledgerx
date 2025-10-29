import { MigrationInterface, QueryRunner } from 'typeorm'

export class addOrganizationPermissions1685519643582 implements MigrationInterface {
  name = 'addOrganizationPermissions1685519643582'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."permission_resource_enum" RENAME TO "permission_resource_enum_old"`)
    await queryRunner.query(
      `CREATE TYPE "public"."permission_resource_enum" AS ENUM('source_of_funds', 'transactions', 'transfers', 'invitations', 'recipients', 'categories', 'members', 'payment_links', 'financial_transactions', 'wallets', 'wallet_groups', 'assets', 'cryptocurrencies', 'settings', 'organizations')`
    )
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "resource" TYPE "public"."permission_resource_enum" USING "resource"::"text"::"public"."permission_resource_enum"`
    )
    await queryRunner.query(`DROP TYPE "public"."permission_resource_enum_old"`)

    const role = await queryRunner.query(
      `SELECT id
        FROM "role"
        WHERE "name" = 'Owner'`
    )
    await queryRunner.query(
      `INSERT INTO "permission"("created_at", "updated_at", "deleted_at", "resource", "action", "role_id")
        VALUES (DEFAULT, DEFAULT, DEFAULT, 'organizations', 'update', '${role[0].id}')`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const role = await queryRunner.query(
      `SELECT id
        FROM "role"
        WHERE "name" = 'Owner'`
    )
    await queryRunner.query(
      `DELETE FROM "permission"
        WHERE resource = 'organizations' and action = 'update' and role_id='${role[0].id}'`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."permission_resource_enum_old" AS ENUM('assets', 'categories', 'cryptocurrencies', 'financial_transactions', 'invitations', 'members', 'payment_links', 'recipients', 'settings', 'source_of_funds', 'transactions', 'transfers', 'wallet_groups', 'wallets')`
    )
    await queryRunner.query(
      `ALTER TABLE "permission" ALTER COLUMN "resource" TYPE "public"."permission_resource_enum_old" USING "resource"::"text"::"public"."permission_resource_enum_old"`
    )
    await queryRunner.query(`DROP TYPE "public"."permission_resource_enum"`)
    await queryRunner.query(`ALTER TYPE "public"."permission_resource_enum_old" RENAME TO "permission_resource_enum"`)
  }
}
