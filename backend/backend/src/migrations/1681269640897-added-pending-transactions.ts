import { MigrationInterface, QueryRunner } from 'typeorm'

export class addedPendingTransactions1681269640897 implements MigrationInterface {
  name = 'addedPendingTransactions1681269640897'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pending_transaction" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "public_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blockchain_id" character varying, "address" character varying NOT NULL, "safe_hash" character varying, "submission_date" TIMESTAMP, "safe_transaction" json, "recipients" json, "nonce" integer, "confirmationsRequired" integer, "confirmations" json, "organization_id" bigint, CONSTRAINT "UQ_85210005ae5ca03203bfd61bf2e" UNIQUE ("public_id"), CONSTRAINT "PK_08a2aefae8ba7b911e0c87adc00" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "pending_transaction" ADD CONSTRAINT "FK_fbaaf97a9bad1f2e9a7d5c2d7a1" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pending_transaction" DROP CONSTRAINT "FK_fbaaf97a9bad1f2e9a7d5c2d7a1"`)
    await queryRunner.query(`DROP TABLE "pending_transaction"`)
  }
}
