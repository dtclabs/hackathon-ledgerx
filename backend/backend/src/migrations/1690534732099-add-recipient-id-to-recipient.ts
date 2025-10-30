import { MigrationInterface, QueryRunner } from 'typeorm'

export class addRecipientIdToRecipient1690534732099 implements MigrationInterface {
  name = 'addRecipientIdToRecipient1690534732099'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recipient_address" ADD "public_id" uuid NOT NULL DEFAULT uuid_generate_v4()`)
    await queryRunner.query(
      `ALTER TABLE "recipient_address" ADD CONSTRAINT "UQ_aa499826a379f733d70646d3dfe" UNIQUE ("public_id")`
    )
    await queryRunner.query(`ALTER TABLE "recipient" ADD "public_id" uuid NOT NULL DEFAULT uuid_generate_v4()`)
    await queryRunner.query(
      `ALTER TABLE "recipient" ADD CONSTRAINT "UQ_b5a3fc61f996cd6bd2c5b55e83a" UNIQUE ("public_id")`
    )
    await queryRunner.query(`ALTER TABLE "chart_of_account_mapping" ADD "recipient_id" bigint`)
    await queryRunner.query(
      `CREATE INDEX "IDX_chart_of_account_organization" ON "recipient" ("organization_id") WHERE "deleted_at" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "chart_of_account_mapping" ADD CONSTRAINT "FK_58d6a9209d1bb0c66f61dbb28b7" FOREIGN KEY ("recipient_id") REFERENCES "recipient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )

    await queryRunner.query(`INSERT INTO "chart_of_account_mapping" ("type", "organization_id", "recipient_id")
        SELECT 'recipient', "organization_id", id from "recipient" where "deleted_at" is null`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "chart_of_account_mapping" WHERE type = 'recipient'`)
    await queryRunner.query(`ALTER TABLE "chart_of_account_mapping" DROP CONSTRAINT "FK_58d6a9209d1bb0c66f61dbb28b7"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_chart_of_account_organization"`)
    await queryRunner.query(`ALTER TABLE "chart_of_account_mapping" DROP COLUMN "recipient_id"`)
    await queryRunner.query(`ALTER TABLE "recipient" DROP CONSTRAINT "UQ_b5a3fc61f996cd6bd2c5b55e83a"`)
    await queryRunner.query(`ALTER TABLE "recipient" DROP COLUMN "public_id"`)
    await queryRunner.query(`ALTER TABLE "recipient_address" DROP CONSTRAINT "UQ_aa499826a379f733d70646d3dfe"`)
    await queryRunner.query(`ALTER TABLE "recipient_address" DROP COLUMN "public_id"`)
  }
}
