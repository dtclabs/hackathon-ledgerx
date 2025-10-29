import { MigrationInterface, QueryRunner } from 'typeorm'

const mappingTypes = ['fee', 'gain', 'loss', 'rounding']

export class seedCoaMappingFromOrganizationAndWallet1688432234386 implements MigrationInterface {
  name = 'seedCoaMappingFromOrganizationAndWallet1688432234386'

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const mappingType of mappingTypes) {
      await queryRunner.query(`INSERT INTO "chart_of_account_mapping" ("type", "organization_id")
    SELECT '${mappingType}', id from "organization" where "deleted_at" is null`)
    }

    await queryRunner.query(`INSERT INTO "chart_of_account_mapping" ("type", "organization_id", "wallet_id")
      SELECT 'wallet', "organization_id", id from "wallet" where "deleted_at" is null`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "chart_of_account_mapping"`)
  }
}
