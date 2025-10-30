import { MigrationInterface, QueryRunner } from 'typeorm'

export class addedNewColumnToWhitelistedAddresses1701321068387 implements MigrationInterface {
  name = 'addedNewColumnToWhitelistedAddresses1701321068387'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "whitelisted_address" ADD "requested_by" character varying NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "whitelisted_address" DROP COLUMN "requested_by"`)
  }
}
