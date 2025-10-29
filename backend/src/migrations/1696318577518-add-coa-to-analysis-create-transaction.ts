import { MigrationInterface, QueryRunner } from 'typeorm'

const roles = ['Owner', 'Admin']
const resources = ['temp_transactions']
const actions = ['create']

export class addCoaToAnalysisCreateTransaction1696318577518 implements MigrationInterface {
  name = 'addCoaToAnalysisCreateTransaction1696318577518'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "analysis_create_transaction" ADD "correspondingChartOfAccounts" json`)

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
    await queryRunner.query(`ALTER TABLE "analysis_create_transaction" DROP COLUMN "correspondingChartOfAccounts"`)
  }
}
