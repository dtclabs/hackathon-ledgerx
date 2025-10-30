import { MigrationInterface, QueryRunner } from 'typeorm'

const roles = ['Owner', 'Admin']
const resource = 'payments'
const actions = ['create', 'read', 'update', 'delete']

export class addPaymentsPermissions1704941339157 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const role of roles) {
      const roleSqlResult = await queryRunner.query(`SELECT id
                                                          FROM "role"
                                                          WHERE "name" = '${role}'`)

      for (const action of actions) {
        await queryRunner.query(
          `INSERT INTO "permission"("created_at", "updated_at", "deleted_at", "resource", "action", "role_id")
                                     VALUES (DEFAULT, DEFAULT, DEFAULT, '${resource}', '${action}', '${roleSqlResult[0].id}')`
        )
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "permission" WHERE "resource" = '${resource}'`)
  }
}
