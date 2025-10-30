import { MigrationInterface, QueryRunner } from 'typeorm'

export class addDirectionToChartOfAccountMapping1691034024098 implements MigrationInterface {
  name = 'addDirectionToChartOfAccountMapping1691034024098'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chart_of_account_mapping" ADD "direction" character varying`)
    await queryRunner.query(
      `UPDATE "chart_of_account_mapping" SET
                      "direction" = 'outgoing'
                      WHERE "type" = 'recipient'`
    )

    await queryRunner.query(`INSERT INTO "chart_of_account_mapping" ("type", "organization_id", "direction", "recipient_id")
      SELECT 'recipient', "organization_id", 'incoming', "recipient_id" from "chart_of_account_mapping" where "deleted_at" is null and "type" = 'recipient'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "chart_of_account_mapping" WHERE "direction" = 'incoming'`)
    await queryRunner.query(`ALTER TABLE "chart_of_account_mapping" DROP COLUMN "direction"`)
  }
}
