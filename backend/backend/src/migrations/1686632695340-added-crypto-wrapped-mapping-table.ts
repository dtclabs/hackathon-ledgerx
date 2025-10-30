import { MigrationInterface, QueryRunner } from 'typeorm'

export class addedCryptoWrappedMappingTable1686632695340 implements MigrationInterface {
  name = 'addedCryptoWrappedMappingTable1686632695340'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "organization_full_sync_request" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "organization_id" character varying NOT NULL, "executed_at" TIMESTAMP, "force_run" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_44c033f5618e5c36b27dcda4087" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "organization_full_sync_request"`)
  }
}
