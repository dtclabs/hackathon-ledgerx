import { MigrationInterface, QueryRunner } from 'typeorm'

export class whitelistedAddresses1701227455571 implements MigrationInterface {
  name = 'whitelistedAddresses1701227455571'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "whitelisted_address" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "address" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_whitelisted_address" UNIQUE ("address"), CONSTRAINT "PK_9679a9ed3d5cefe2f733614a158" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "whitelisted_address"`)
  }
}
