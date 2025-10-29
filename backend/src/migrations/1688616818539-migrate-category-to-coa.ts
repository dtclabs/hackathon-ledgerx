import { MigrationInterface, QueryRunner } from 'typeorm'

export class migrateCategoryToCoa1688616818539 implements MigrationInterface {
  name = 'migrateCategoryToCoa1688616818539'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_coa_map_organization"`)
    await queryRunner.query(
      `CREATE INDEX "IDX_coa_map_organization_type" ON "chart_of_account_mapping" ("organization_id", "type") WHERE "deleted_at" IS NULL`
    )

    await queryRunner.query(`ALTER TABLE "temp_transactions_entity" ADD "coa_id" bigint`)
    await queryRunner.query(
      `ALTER TABLE "temp_transactions_entity" ADD CONSTRAINT "FK_736ad46bf4ae4918a4ce067ec83" FOREIGN KEY ("coa_id") REFERENCES "chart_of_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(`INSERT INTO "chart_of_account" ("name", "code", "type", "description", "organization_id", "source", "status", "created_by")
        SELECT name, code, type, description, "organizationId", 'hq', 'ACTIVE', "createdById" from "category" where "deleted_at" is null`)
    const childMetadataList = await queryRunner.query(
      `SELECT id, "category_id" FROM "financial_transaction_child_metadata" WHERE "deleted_at" is null and "category_id" is not null`
    )
    for (const childMetadata of childMetadataList) {
      await queryRunner.query(`UPDATE "financial_transaction_child_metadata" SET "coa_id" = "subquery"."id" 
            FROM ( SELECT "chart_of_account".id FROM "chart_of_account", "category" 
            WHERE "chart_of_account"."organization_id" = "category"."organizationId" AND "category"."id" = '${childMetadata.category_id}' 
            AND "chart_of_account"."code" = "category"."code") "subquery"
            WHERE "financial_transaction_child_metadata"."id" = '${childMetadata.id}'`)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "financial_transaction_child_metadata" SET "coa_id" = NULL WHERE "category_id" is not null`
    )
    await queryRunner.query(`DELETE FROM "chart_of_account" WHERE "chart_of_account"."id" NOT IN 
              (SELECT "chart_of_account_id" FROM "chart_of_account_mapping" where "chart_of_account_id" is not null )`)
    await queryRunner.query(`ALTER TABLE "temp_transactions_entity" DROP CONSTRAINT "FK_736ad46bf4ae4918a4ce067ec83"`)
    await queryRunner.query(`ALTER TABLE "temp_transactions_entity" DROP COLUMN "coa_id"`)

    await queryRunner.query(`DROP INDEX "public"."IDX_coa_map_organization_type"`)
    await queryRunner.query(
      `CREATE INDEX "IDX_coa_map_organization" ON "chart_of_account_mapping" ("organization_id") WHERE (deleted_at IS NULL)`
    )
  }
}
