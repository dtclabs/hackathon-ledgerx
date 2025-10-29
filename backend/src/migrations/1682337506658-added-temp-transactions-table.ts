import { MigrationInterface, QueryRunner } from 'typeorm'

export class addedTempTransactionsTable1682337506658 implements MigrationInterface {
  name = 'addedTempTransactionsTable1682337506658'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temp_transactions_entity" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "blockchain_id" character varying, "organization_id" character varying NOT NULL, "comment" character varying, "hash" character varying, "safe_hash" character varying, "time_stamp" TIMESTAMP, "is_executed" boolean NOT NULL, "submission_date" TIMESTAMP, "metamask_transaction" json, "ftx_transaction" json, "safe_transaction" json, "draft_transaction" json, "recipients" json, "token_address" character varying, "type" character varying, "symbol" character varying, "method" character varying, "is_draft" boolean, "files" text, "pastUSDGasFee" character varying, "migrated_at" TIMESTAMP, "category_id" bigint, "tx_creator" bigint, CONSTRAINT "PK_5b482eb12233e3755f8da6a8220" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "temp_transactions_entity" ADD CONSTRAINT "FK_8f8d5f7abf885b2787a5ba4aa5a" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "temp_transactions_entity" ADD CONSTRAINT "FK_9cd2718b75ca584f3e77701b4f3" FOREIGN KEY ("tx_creator") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "temp_transactions_entity"`)
  }
}
