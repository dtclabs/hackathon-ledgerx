import { MigrationInterface, QueryRunner } from 'typeorm'

export class addOptimismChain1708572436211 implements MigrationInterface {
  name = 'addOptimismChain1708572436211'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "optimism_log" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "contract_address" character varying NOT NULL, "block_hash" character varying NOT NULL, "block_number" integer NOT NULL, "block_timestamp" character varying NOT NULL, "blockchain_id" character varying NOT NULL, "transaction_hash" character varying NOT NULL, "log_index" integer NOT NULL, "topic0" character varying NOT NULL, "topic1" character varying, "topic2" character varying, "topic3" character varying, "data" character varying NOT NULL, "initiator_address" character varying, "from_address" character varying, "to_address" character varying, CONSTRAINT "UQ_optimism_log_transaction_hash_blockchain_log_index" UNIQUE ("transaction_hash", "blockchain_id", "log_index"), CONSTRAINT "PK_3cb5d094a35eda15091c08557ac" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "optimism_receipt" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "block_hash" character varying NOT NULL, "block_number" integer NOT NULL, "block_timestamp" character varying NOT NULL, "blockchain_id" character varying NOT NULL, "transaction_hash" character varying NOT NULL, "from_address" character varying NOT NULL, "to_address" character varying, "gas_used" character varying NOT NULL, "gas_price" character varying NOT NULL, "status" character varying NOT NULL, "contract_address" character varying, "transaction_index" character varying NOT NULL, "input" character varying NOT NULL, "type" character varying NOT NULL, "value" character varying NOT NULL, "nonce" character varying NOT NULL, "is_error" boolean NOT NULL, "l1_fee" character varying NOT NULL, "l1_fee_scalar" character varying NOT NULL, "l1_gas_price" character varying NOT NULL, "l1_gas_used" character varying NOT NULL, CONSTRAINT "UQ_optimism_receipt_transaction_hash_blockchain" UNIQUE ("transaction_hash", "blockchain_id"), CONSTRAINT "PK_5bc17093281dbec18925593ee1f" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "optimism_transaction_detail" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "hash" character varying NOT NULL, "blockchain_id" character varying NOT NULL, "method_id" character varying, "function_name" character varying, "error_description" character varying, CONSTRAINT "UQ_optimism_transaction_detail_hash_blockchain" UNIQUE ("hash", "blockchain_id"), CONSTRAINT "PK_097d2cb96fc94047a664d942f42" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "optimism_address_transaction" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "hash" character varying NOT NULL, "blockchain_id" character varying NOT NULL, "block_number" integer NOT NULL, "address" character varying NOT NULL, "status" character varying NOT NULL, "contract_configuration_id" bigint, CONSTRAINT "UQ_optimism_address_transaction_hash_blockchain_address_config" UNIQUE ("hash", "blockchain_id", "address", "contract_configuration_id"), CONSTRAINT "PK_12d1a196705af892c5c76ef82d1" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_optimism_address_transaction_address_blockchain_status" ON "optimism_address_transaction" ("address", "blockchain_id", "status") WHERE deleted_at IS NULL`
    )
    await queryRunner.query(
      `CREATE TABLE "optimism_trace" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "block_number" integer NOT NULL, "block_timestamp" character varying NOT NULL, "blockchain_id" character varying NOT NULL, "transaction_hash" character varying NOT NULL, "from_address" character varying NOT NULL, "to_address" character varying NOT NULL, "value" character varying NOT NULL, "call_type" character varying NOT NULL, "is_error" boolean NOT NULL, "error_code" character varying NOT NULL, "gas" character varying NOT NULL, "gasUsed" character varying NOT NULL, "input" character varying NOT NULL, "status" character varying NOT NULL, "trace_id" character varying, "trace_index" integer NOT NULL, CONSTRAINT "UQ_optimism_trace_transactionHash_blockchain_traceIndex" UNIQUE ("transaction_hash", "blockchain_id", "trace_index"), CONSTRAINT "PK_99f46d5a01a0ec7825248caa725" PRIMARY KEY ("id"))`
    )

    await queryRunner.query(`INSERT INTO "blockchain" ("public_id", "name", "chain_id", "is_enabled", "is_testnet",
        "block_explorer", "api_url", "image_url", "safe_url", "coingecko_asset_platform_id", "request_finance_name")
VALUES ('optimism', 'Optimism', 10, false, false, 'https://optimistic.etherscan.io/',
'https://api-optimistic.etherscan.io/api', 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/optimism.png',
'https://safe-transaction-optimism.safe.global', 'optimistic-ethereum', 'optimism')`)

    const ethererumCryptocurrencyId = await queryRunner.query(
      `SELECT id FROM "cryptocurrency" WHERE "name" = 'Ethereum' and "is_verified" = true`
    )
    await queryRunner.query(
      `INSERT INTO "cryptocurrency_address"("created_at", "updated_at", "deleted_at", "type", "address", "cryptocurrency_id", "decimal", "blockchain_id") VALUES (DEFAULT, DEFAULT, DEFAULT, 'Coin', '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000', '${ethererumCryptocurrencyId[0].id}', 18, 'optimism' )`
    )

    await queryRunner.query(`insert into contract_configuration (name, contract_address, blockchain_id,
      topic0, topic1, topic2, topic3)
values ('All Transfers', null, 'optimism',
'0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
'address_out', 'address_in', null)`)

    await queryRunner.query(
      `insert into contract_configuration (name, contract_address, blockchain_id,
                                           topic0, topic1, topic2, topic3)
       values ('WETH Deposit', '0x4200000000000000000000000000000000000006', 'optimism',
               '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c', 'address_in', null, null)`
    )

    await queryRunner.query(
      `insert into contract_configuration (name, contract_address, blockchain_id,
                                           topic0, topic1, topic2, topic3)
       values ('WETH Withdrawal', '0x4200000000000000000000000000000000000006', 'optimism',
               '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65', 'address_out', null, null)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "contract_configuration" where "blockchain_id" = 'optimism' and "name" = 'All Transfers'`
    )
    await queryRunner.query(`DELETE FROM "cryptocurrency_address" where "blockchain_id" = 'optimism'`)
    await queryRunner.query(`DELETE FROM "blockchain" where "public_id" = 'optimism'`)

    await queryRunner.query(`DROP TABLE "optimism_transaction_detail"`)
    await queryRunner.query(`DROP TABLE "optimism_receipt"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_optimism_address_transaction_address_blockchain_status"`)
    await queryRunner.query(`DROP TABLE "optimism_address_transaction"`)
    await queryRunner.query(`DROP TABLE "optimism_trace"`)
    await queryRunner.query(`DROP TABLE "optimism_log"`)
  }
}
