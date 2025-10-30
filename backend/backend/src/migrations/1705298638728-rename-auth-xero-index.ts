import { MigrationInterface, QueryRunner } from 'typeorm'

export class renameAuthXeroIndex1705298638728 implements MigrationInterface {
  name = 'renameAuthXeroIndex1705298638728'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_ec34eff0c95e12a969f0eeb600"`)
    await queryRunner.query(`CREATE INDEX "IDX_auth_xero_user_id" ON "auth_xero" ("xero_user_id") `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_auth_xero_user_id"`)
    await queryRunner.query(`CREATE INDEX "IDX_ec34eff0c95e12a969f0eeb600" ON "auth_xero" ("xero_user_id") `)
  }
}
