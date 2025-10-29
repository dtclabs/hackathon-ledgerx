import { MigrationInterface, QueryRunner } from 'typeorm'

export class addBlockRewardTable1694089718929 implements MigrationInterface {
  name = 'addBlockRewardTable1694089718929'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "polygon_block_reward"
                             (
                                 "id"                  BIGSERIAL         NOT NULL,
                                 "created_at"          TIMESTAMP         NOT NULL DEFAULT now(),
                                 "updated_at"          TIMESTAMP         NOT NULL DEFAULT now(),
                                 "deleted_at"          TIMESTAMP,
                                 "validated_by_address" character varying NOT NULL,
                                 "block_number"        integer           NOT NULL,
                                 "block_timestamp"     character varying NOT NULL,
                                 "blockchain_id"       character varying NOT NULL,
                                 "block_reward"        character varying NOT NULL,
                                 CONSTRAINT "UQ_polygon_block_reward_address_blockchain_block_index" UNIQUE ("validated_by_address", "blockchain_id", "block_number"),
                                 CONSTRAINT "PK_9c2f81a81e7b57a867d8c208513" PRIMARY KEY ("id")
                             )`)

    await queryRunner.query(`DROP INDEX "public"."IDX_fin_txn_child_toAddr_fromAddr_orgId_blockchainId"`)
    await queryRunner.query(`ALTER TABLE "financial_transaction_child" ALTER COLUMN "from_address" DROP NOT NULL`)
    await queryRunner.query(
      `CREATE INDEX "IDX_fin_txn_child_toAddr_fromAddr_orgId_blockchainId" ON "financial_transaction_child" ("to_address", "from_address", "organization_id", "blockchain_id") WHERE "deleted_at" IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "polygon_block_reward"`)

    await queryRunner.query(`DROP INDEX "public"."IDX_fin_txn_child_toAddr_fromAddr_orgId_blockchainId"`)
    await queryRunner.query(`ALTER TABLE "financial_transaction_child" ALTER COLUMN "from_address" SET NOT NULL`)
    await queryRunner.query(
      `CREATE INDEX "IDX_fin_txn_child_toAddr_fromAddr_orgId_blockchainId" ON "financial_transaction_child" ("organization_id", "from_address", "to_address", "blockchain_id") WHERE (deleted_at IS NULL)`
    )
  }
}
