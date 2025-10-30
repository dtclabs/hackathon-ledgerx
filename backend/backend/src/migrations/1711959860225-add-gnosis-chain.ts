import { MigrationInterface, QueryRunner } from 'typeorm'

export class addGnosisChain1711959860225 implements MigrationInterface {
  name = 'addGnosisChain1711959860225'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "gnosis_address_transaction"
                             (
                               "id"                        BIGSERIAL         NOT NULL,
                               "created_at"                TIMESTAMP         NOT NULL DEFAULT now(),
                               "updated_at"                TIMESTAMP         NOT NULL DEFAULT now(),
                               "deleted_at"                TIMESTAMP,
                               "hash"                      character varying NOT NULL,
                               "blockchain_id"             character varying NOT NULL,
                               "block_number"              integer           NOT NULL,
                               "address"                   character varying NOT NULL,
                               "status"                    character varying NOT NULL,
                               "contract_configuration_id" bigint,
                               CONSTRAINT "UQ_gnosis_address_transaction_hash_blockchain_address_config" UNIQUE ("hash", "blockchain_id", "address", "contract_configuration_id"),
                               CONSTRAINT "PK_1b8277fd1ccb9841aa1cd32ae58" PRIMARY KEY ("id")
                             )`)
    await queryRunner.query(
      `CREATE INDEX "IDX_gnosis_address_transaction_address_blockchain_status" ON "gnosis_address_transaction" ("address", "blockchain_id", "status") WHERE deleted_at IS NULL`
    )
    await queryRunner.query(`CREATE TABLE "gnosis_receipt"
                             (
                               "id"                BIGSERIAL         NOT NULL,
                               "created_at"        TIMESTAMP         NOT NULL DEFAULT now(),
                               "updated_at"        TIMESTAMP         NOT NULL DEFAULT now(),
                               "deleted_at"        TIMESTAMP,
                               "block_hash"        character varying NOT NULL,
                               "block_number"      integer           NOT NULL,
                               "block_timestamp"   character varying NOT NULL,
                               "blockchain_id"     character varying NOT NULL,
                               "transaction_hash"  character varying NOT NULL,
                               "from_address"      character varying NOT NULL,
                               "to_address"        character varying,
                               "gas_used"          character varying NOT NULL,
                               "gas_price"         character varying NOT NULL,
                               "status"            character varying NOT NULL,
                               "contract_address"  character varying,
                               "transaction_index" character varying NOT NULL,
                               "input"             character varying NOT NULL,
                               "type"              character varying NOT NULL,
                               "value"             character varying NOT NULL,
                               "nonce"             character varying NOT NULL,
                               "is_error"          boolean           NOT NULL,
                               CONSTRAINT "UQ_gnosis_receipt_transaction_hash_blockchain" UNIQUE ("transaction_hash", "blockchain_id"),
                               CONSTRAINT "PK_4a3c1b6d7d2a7482472fd3e118f" PRIMARY KEY ("id")
                             )`)
    await queryRunner.query(`CREATE TABLE "gnosis_log"
                             (
                               "id"                BIGSERIAL         NOT NULL,
                               "created_at"        TIMESTAMP         NOT NULL DEFAULT now(),
                               "updated_at"        TIMESTAMP         NOT NULL DEFAULT now(),
                               "deleted_at"        TIMESTAMP,
                               "contract_address"  character varying NOT NULL,
                               "block_hash"        character varying NOT NULL,
                               "block_number"      integer           NOT NULL,
                               "block_timestamp"   character varying NOT NULL,
                               "blockchain_id"     character varying NOT NULL,
                               "transaction_hash"  character varying NOT NULL,
                               "log_index"         integer           NOT NULL,
                               "topic0"            character varying NOT NULL,
                               "topic1"            character varying,
                               "topic2"            character varying,
                               "topic3"            character varying,
                               "data"              character varying NOT NULL,
                               "initiator_address" character varying,
                               "from_address"      character varying,
                               "to_address"        character varying,
                               CONSTRAINT "UQ_gnosis_log_transaction_hash_blockchain_log_index" UNIQUE ("transaction_hash", "blockchain_id", "log_index"),
                               CONSTRAINT "PK_80d72ca2339bec8acacc4937537" PRIMARY KEY ("id")
                             )`)
    await queryRunner.query(`CREATE TABLE "gnosis_transaction_detail"
                             (
                               "id"                BIGSERIAL         NOT NULL,
                               "created_at"        TIMESTAMP         NOT NULL DEFAULT now(),
                               "updated_at"        TIMESTAMP         NOT NULL DEFAULT now(),
                               "deleted_at"        TIMESTAMP,
                               "hash"              character varying NOT NULL,
                               "blockchain_id"     character varying NOT NULL,
                               "method_id"         character varying,
                               "function_name"     character varying,
                               "error_description" character varying,
                               CONSTRAINT "UQ_gnosis_transaction_detail_hash_blockchain" UNIQUE ("hash", "blockchain_id"),
                               CONSTRAINT "PK_193aee47ea4f7507e9f3fb51c2d" PRIMARY KEY ("id")
                             )`)
    await queryRunner.query(`CREATE TABLE "gnosis_trace"
                             (
                               "id"               BIGSERIAL         NOT NULL,
                               "created_at"       TIMESTAMP         NOT NULL DEFAULT now(),
                               "updated_at"       TIMESTAMP         NOT NULL DEFAULT now(),
                               "deleted_at"       TIMESTAMP,
                               "block_number"     integer           NOT NULL,
                               "block_timestamp"  character varying NOT NULL,
                               "blockchain_id"    character varying NOT NULL,
                               "transaction_hash" character varying NOT NULL,
                               "from_address"     character varying NOT NULL,
                               "to_address"       character varying NOT NULL,
                               "value"            character varying NOT NULL,
                               "call_type"        character varying NOT NULL,
                               "is_error"         boolean           NOT NULL,
                               "error_code"       character varying NOT NULL,
                               "gas"              character varying NOT NULL,
                               "gasUsed"          character varying NOT NULL,
                               "input"            character varying NOT NULL,
                               "status"           character varying NOT NULL,
                               "trace_id"         character varying,
                               "trace_index"      integer           NOT NULL,
                               CONSTRAINT "UQ_gnosis_trace_transactionHash_blockchain_traceIndex" UNIQUE ("transaction_hash", "blockchain_id", "trace_index"),
                               CONSTRAINT "PK_9122a1c2e9d3a702e1d0b8c7569" PRIMARY KEY ("id")
                             )`)

    await queryRunner.query(`INSERT INTO "blockchain" ("public_id", "name", "chain_id", "is_enabled", "is_testnet",
                                                       "block_explorer", "api_url", "image_url", "safe_url",
                                                       "coingecko_asset_platform_id", "request_finance_name", "rpc_url")
                             VALUES ('gnosis_chain', 'Gnosis Chain', 100, false, false, 'https://gnosisscan.io/',
                                     'https://api.gnosisscan.io/api',
                                     'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/gnosis-chain.png',
                                     'https://safe-transaction-gnosis-chain.safe.global', 'xdai',
                                     'gnosis-chain', 'https://rpc.gnosischain.com')`)

    await queryRunner.query(
      `insert into cryptocurrency (name, symbol, coingecko_id, is_verified)
       select 'XDAI/WXDAI', 'XDAI', 'xdai', false
       where not exists (select 1 from cryptocurrency where coingecko_id = 'xdai')`
    )

    await queryRunner.query(
      `insert into cryptocurrency_address (type, address, cryptocurrency_id, "decimal", blockchain_id)
       select 'Coin', '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', c.id, 18, 'gnosis_chain'
       from cryptocurrency c
       where c.coingecko_id = 'xdai'`
    )

    await queryRunner.query(`insert into contract_configuration (name, contract_address, blockchain_id,
                                                                 topic0, topic1, topic2, topic3)
                             values ('All Transfers', null, 'gnosis_chain',
                                     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                                     'address_out', 'address_in', null)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "contract_configuration" where "blockchain_id" = 'gnosis_chain'`)
    await queryRunner.query(`DELETE FROM "cryptocurrency_address" where "blockchain_id" = 'gnosis_chain'`)
    await queryRunner.query(`DELETE FROM "blockchain" where "public_id" = 'gnosis_chain'`)

    await queryRunner.query(`DROP TABLE "gnosis_trace"`)
    await queryRunner.query(`DROP TABLE "gnosis_transaction_detail"`)
    await queryRunner.query(`DROP TABLE "gnosis_log"`)
    await queryRunner.query(`DROP TABLE "gnosis_receipt"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_gnosis_address_transaction_address_blockchain_status"`)
    await queryRunner.query(`DROP TABLE "gnosis_address_transaction"`)
  }
}
