import { MigrationInterface, QueryRunner } from 'typeorm'

const roles = ['Owner', 'Admin']
const resources = ['balances']
const actions = ['read']

export class multichainAddPermissionsForBalance1690781500711 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
  }
}
