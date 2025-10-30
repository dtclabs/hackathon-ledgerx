import { MigrationInterface, QueryRunner } from 'typeorm'

export class addArbiscanTables1700564589683 implements MigrationInterface {
  name = 'addArbiscanTables1700564589683'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_bsc_trace_transaction_hash"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_polygon_trace_transaction_hash"`)
    await queryRunner.query(
      `CREATE TABLE "arbitrum_log" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "contract_address" character varying NOT NULL, "block_hash" character varying NOT NULL, "block_number" integer NOT NULL, "block_timestamp" character varying NOT NULL, "blockchain_id" character varying NOT NULL, "transaction_hash" character varying NOT NULL, "log_index" integer NOT NULL, "topic0" character varying NOT NULL, "topic1" character varying, "topic2" character varying, "topic3" character varying, "data" character varying NOT NULL, "initiator_address" character varying, "from_address" character varying, "to_address" character varying, CONSTRAINT "UQ_arbitrum_log_transaction_hash_blockchain_log_index" UNIQUE ("transaction_hash", "blockchain_id", "log_index"), CONSTRAINT "PK_ffc1b89d474e88e32695a1810eb" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "arbitrum_address_transaction" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "hash" character varying NOT NULL, "blockchain_id" character varying NOT NULL, "block_number" integer NOT NULL, "address" character varying NOT NULL, "status" character varying NOT NULL, "contract_configuration_id" bigint, CONSTRAINT "UQ_arbitrum_address_transaction_hash_blockchain_address_config" UNIQUE ("hash", "blockchain_id", "address", "contract_configuration_id"), CONSTRAINT "PK_4e1b09003538a98a80475197f65" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_arbitrum_address_transaction_address_blockchain_status" ON "arbitrum_address_transaction" ("address", "blockchain_id", "status") WHERE deleted_at IS NULL`
    )
    await queryRunner.query(
      `CREATE TABLE "arbitrum_transaction_detail" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "hash" character varying NOT NULL, "blockchain_id" character varying NOT NULL, "method_id" character varying, "function_name" character varying, "error_description" character varying, CONSTRAINT "UQ_arbitrum_transaction_detail_hash_blockchain" UNIQUE ("hash", "blockchain_id"), CONSTRAINT "PK_d37da4e57bb8538617b3d7987a6" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "arbitrum_receipt" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "block_hash" character varying NOT NULL, "block_number" integer NOT NULL, "block_timestamp" character varying NOT NULL, "blockchain_id" character varying NOT NULL, "transaction_hash" character varying NOT NULL, "from_address" character varying NOT NULL, "to_address" character varying, "gas_used" character varying NOT NULL, "gas_price" character varying NOT NULL, "status" character varying NOT NULL, "contract_address" character varying, "transaction_index" character varying NOT NULL, "input" character varying NOT NULL, "type" character varying NOT NULL, "value" character varying NOT NULL, "nonce" character varying NOT NULL, "is_error" boolean NOT NULL, "fee_stats" jsonb, CONSTRAINT "UQ_arbitrum_receipt_transaction_hash_blockchain" UNIQUE ("transaction_hash", "blockchain_id"), CONSTRAINT "PK_84aff52f2bc7b1ad21ef90ea64e" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "arbitrum_trace" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "block_number" integer NOT NULL, "block_timestamp" character varying NOT NULL, "blockchain_id" character varying NOT NULL, "transaction_hash" character varying NOT NULL, "from_address" character varying NOT NULL, "to_address" character varying NOT NULL, "value" character varying NOT NULL, "call_type" character varying NOT NULL, "is_error" boolean NOT NULL, "error_code" character varying NOT NULL, "gas" character varying NOT NULL, "gasUsed" character varying NOT NULL, "input" character varying NOT NULL, "status" character varying NOT NULL, "trace_id" character varying, "trace_index" integer NOT NULL, CONSTRAINT "UQ_arbitrum_trace_transactionHash_blockchain_traceIndex" UNIQUE ("transaction_hash", "blockchain_id", "trace_index"), CONSTRAINT "PK_e80cff6750dd6f0705e09631363" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`ALTER TABLE "financial_transaction_preprocess" DROP COLUMN "raw_transaction_id"`)
    await queryRunner.query(
      `ALTER TABLE "bsc_trace" ADD CONSTRAINT "UQ_bsc_trace_transactionHash_blockchain_traceIndex" UNIQUE ("transaction_hash", "blockchain_id", "trace_index")`
    )
    await queryRunner.query(
      `ALTER TABLE "polygon_trace" ADD CONSTRAINT "UQ_polygon_trace_transactionHash_blockchain_traceIndex" UNIQUE ("transaction_hash", "blockchain_id", "trace_index")`
    )

    await queryRunner.query(`INSERT INTO "blockchain" ("public_id", "name", "chain_id", "is_enabled", "is_testnet",
        "block_explorer", "api_url", "image_url", "safe_url", "coingecko_asset_platform_id", "request_finance_name")
VALUES ('arbitrum_one', 'Arbitrum One', 42161, false, false, 'https://arbiscan.io/',
'https://api.arbiscan.io/api', 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/arbitrum.png',
'https://safe-transaction-arbitrum.safe.global', 'arbitrum-one', 'arbitrum-one')`)

    const ethererumCryptocurrencyId = await queryRunner.query(
      `SELECT id FROM "cryptocurrency" WHERE "name" = 'Ethereum' and "is_verified" = true`
    )
    await queryRunner.query(
      `INSERT INTO "cryptocurrency_address"("created_at", "updated_at", "deleted_at", "type", "address", "cryptocurrency_id", "decimal", "blockchain_id") VALUES (DEFAULT, DEFAULT, DEFAULT, 'Coin', null, '${ethererumCryptocurrencyId[0].id}', 18, 'arbitrum_one' )`
    )

    await queryRunner.query(`insert into contract_configuration (name, contract_address, blockchain_id,
      topic0, topic1, topic2, topic3)
values ('All Transfers', null, 'arbitrum_one',
'0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
'address_out', 'address_in', null)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "contract_configuration" where "blockchain_id" = 'arbitrum_one' and "name" = 'All Transfers'`
    )
    await queryRunner.query(
      `DELETE FROM "cryptocurrency_address" where "blockchain_id" = 'arbitrum_one' and "type" = 'Coin'`
    )
    await queryRunner.query(`DELETE FROM "blockchain" where "public_id" = 'arbitrum_one'`)
    await queryRunner.query(
      `ALTER TABLE "polygon_trace" DROP CONSTRAINT "UQ_polygon_trace_transactionHash_blockchain_traceIndex"`
    )
    await queryRunner.query(
      `ALTER TABLE "bsc_trace" DROP CONSTRAINT "UQ_bsc_trace_transactionHash_blockchain_traceIndex"`
    )
    await queryRunner.query(`ALTER TABLE "financial_transaction_preprocess" ADD "raw_transaction_id" character varying`)
    await queryRunner.query(`DROP TABLE "arbitrum_trace"`)
    await queryRunner.query(`DROP TABLE "arbitrum_receipt"`)
    await queryRunner.query(`DROP TABLE "arbitrum_transaction_detail"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_arbitrum_address_transaction_address_blockchain_status"`)
    await queryRunner.query(`DROP TABLE "arbitrum_address_transaction"`)
    await queryRunner.query(`DROP TABLE "arbitrum_log"`)
    await queryRunner.query(
      `CREATE INDEX "IDX_polygon_trace_transaction_hash" ON "polygon_trace" ("transaction_hash") `
    )
    await queryRunner.query(`CREATE INDEX "IDX_bsc_trace_transaction_hash" ON "bsc_trace" ("transaction_hash") `)
  }
}
