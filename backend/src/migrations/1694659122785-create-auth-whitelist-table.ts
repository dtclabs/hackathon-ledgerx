import { MigrationInterface, QueryRunner } from 'typeorm'

export class createAuthWhitelistTable1694659122785 implements MigrationInterface {
  name = 'createAuthWhitelistTable1694659122785'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_whitelist" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "identifier" character varying NOT NULL, "provider" character varying NOT NULL, CONSTRAINT "UQ_auth_whitelist_identifier_provider" UNIQUE ("identifier", "provider"), CONSTRAINT "PK_9e0141452b93a925a54b93c7f01" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "auth_whitelist"`)
  }
}
