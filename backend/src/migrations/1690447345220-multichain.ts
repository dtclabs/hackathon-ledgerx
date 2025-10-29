import { MigrationInterface, QueryRunner } from 'typeorm'

export class multichain1690447345220 implements MigrationInterface {
  name = 'multichain1690447345220'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bsc_address_transaction"
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
         CONSTRAINT "UQ_bsc_address_transaction_hash_blockchain_address_configuration" UNIQUE ("hash", "blockchain_id", "address", "contract_configuration_id"),
         CONSTRAINT "PK_5194d19449198267007b41c5556" PRIMARY KEY ("id")
       )`
    )
    await queryRunner.query(
      `CREATE TABLE "bsc_log"
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
         CONSTRAINT "UQ_bsc_log_transaction_hash_blockchain_log_index" UNIQUE ("transaction_hash", "blockchain_id", "log_index"),
         CONSTRAINT "PK_1a07da7672d473c25850837cac5" PRIMARY KEY ("id")
       )`
    )
    await queryRunner.query(
      `CREATE TABLE "bsc_trace"
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
         CONSTRAINT "PK_857e85315cc63b641fb9648ee07" PRIMARY KEY ("id")
       )`
    )
    await queryRunner.query(`CREATE INDEX "IDX_bsc_trace_transaction_hash" ON "bsc_trace" ("transaction_hash") `)
    await queryRunner.query(
      `CREATE TABLE "bsc_receipt"
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
         CONSTRAINT "UQ_bsc_receipt_transaction_hash_blockchain" UNIQUE ("transaction_hash", "blockchain_id"),
         CONSTRAINT "PK_a98622ecc0b7a3db36cba4b8dbb" PRIMARY KEY ("id")
       )`
    )
    await queryRunner.query(
      `CREATE TABLE "bsc_transaction_detail"
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
         CONSTRAINT "UQ_bsc_transaction_detail_hash_blockchain" UNIQUE ("hash", "blockchain_id"),
         CONSTRAINT "PK_e9eae9b4e2f50861641ebac3e4e" PRIMARY KEY ("id")
       )`
    )
    await queryRunner.query(
      `CREATE TABLE "polygon_log"
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
         CONSTRAINT "UQ_polygon_log_transaction_hash_blockchain_log_index" UNIQUE ("transaction_hash", "blockchain_id", "log_index"),
         CONSTRAINT "PK_c5ae49fc485f810f74c84e2dd95" PRIMARY KEY ("id")
       )`
    )
    await queryRunner.query(
      `CREATE TABLE "polygon_address_transaction"
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
         CONSTRAINT "UQ_polygon_address_transaction_hash_blockchain_address_configuration" UNIQUE ("hash", "blockchain_id", "address", "contract_configuration_id"),
         CONSTRAINT "PK_d39f4030767358aa72ca278b5ce" PRIMARY KEY ("id")
       )`
    )
    await queryRunner.query(
      `CREATE TABLE "polygon_trace"
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
         CONSTRAINT "PK_7901fdba8627ea4f2916ace08d6" PRIMARY KEY ("id")
       )`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_polygon_trace_transaction_hash" ON "polygon_trace" ("transaction_hash") `
    )
    await queryRunner.query(
      `CREATE TABLE "polygon_transaction_detail"
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
         CONSTRAINT "UQ_polygon_transaction_detail_hash_blockchain" UNIQUE ("hash", "blockchain_id"),
         CONSTRAINT "PK_34c6a27f3cd5132f6cd24f7cb21" PRIMARY KEY ("id")
       )`
    )
    await queryRunner.query(
      `CREATE TABLE "polygon_receipt"
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
         CONSTRAINT "UQ_polygon_receipt_transaction_hash_blockchain" UNIQUE ("transaction_hash", "blockchain_id"),
         CONSTRAINT "PK_70858c18a23dc422f95e13aff67" PRIMARY KEY ("id")
       )`
    )
    await queryRunner.query(`ALTER TABLE "blockchain"
      ADD "safe_api_url" character varying`)
    await queryRunner.query(`ALTER TABLE "blockchain"
      ADD "coingecko_asset_platform_id" character varying`)

    await queryRunner.query(`ALTER TABLE "wallet"
      ADD "supported_blockchains" json`)
    await queryRunner.query(`update wallet
                             set supported_blockchains = '["ethereum"]'`)
    await queryRunner.query(`alter table wallet
      alter column supported_blockchains set not null;`)

    await queryRunner.query(`ALTER TABLE "wallet"
      ADD "owned_cryptocurrencies" json`)
    await queryRunner.query(
      `ALTER TABLE "cryptocurrency"
        ADD CONSTRAINT "UQ_4cfaa879c293ed0122e216b885e" UNIQUE ("coingecko_id")`
    )

    await queryRunner.query(`insert into blockchain (public_id, name, chain_id, is_enabled, is_testnet,
                                                     block_explorer, api_url, safe_api_url, coingecko_asset_platform_id)
                             values ('polygon', 'Polygon Mainnet', 137, false, false, 'https://polygonscan.com/',
                                     'https://api.polygonscan.com/api',
                                     'https://safe-transaction-polygon.safe.global/api', 'polygon-pos')`)
    await queryRunner.query(`insert into blockchain (public_id, name, chain_id, is_enabled, is_testnet,
                                                     block_explorer, api_url, safe_api_url, coingecko_asset_platform_id)
                             values ('bsc', 'BNB Smart Chain Mainnet', 56, false, false, 'https://bscscan.com/',
                                     'https://api.bscscan.com/api',
                                     'https://safe-transaction.bsc.gnosis.io/api', 'binance-smart-chain')`)

    await queryRunner.query(`update blockchain
                             set safe_api_url                = 'https://safe-transaction-mainnet.safe.global/api',
                                 coingecko_asset_platform_id = 'ethereum'
                             where public_id = 'ethereum'`)

    await queryRunner.query(` update blockchain
                              set safe_api_url = 'https://safe-transaction-goerli.safe.global/api'
                              where public_id = 'goerli'`)

    // Add native coin for polygon
    await queryRunner.query(`insert into cryptocurrency_address
                               (type, address, cryptocurrency_id, decimal, blockchain_id)
                             select 'Coin', '0x0000000000000000000000000000000000001010', id, 18, 'polygon'
                             from cryptocurrency
                             where symbol = 'MATIC'`)

    // Add contract configurations
    await queryRunner.query(`insert into contract_configuration (name, contract_address, blockchain_id,
                                                                 topic0, topic1, topic2, topic3)
                             values ('All Transfers', null, 'polygon',
                                     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                                     'address_out', 'address_in', null)`)

    await queryRunner.query(`insert into contract_configuration (name, contract_address, blockchain_id,
                                                                 topic0, topic1, topic2, topic3)
                             values ('WMATIC Withdrawal', '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', 'polygon',
                                     '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
                                     'address_out', null, null)`)

    await queryRunner.query(`insert into contract_configuration (name, contract_address, blockchain_id,
                                                                 topic0, topic1, topic2, topic3)
                             values ('WMATIC Deposit', '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', 'polygon',
                                     '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
                                     'address_in', null, null)`)

    await queryRunner.query(
      `insert into feature_flag (name, is_enabled)
       values ('wallet_blockchain_configuration', false)`
    )

    await queryRunner.query(
      `insert into cryptocurrency (name, symbol, coingecko_id, is_verified)
       values ('Wrapped Matic', 'WMATIC', 'wmatic', false)`
    )

    await queryRunner.query(
      `insert into cryptocurrency_address (type, address, cryptocurrency_id, "decimal", blockchain_id)
       select 'Token', '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', c.id, 18, 'polygon'
       from cryptocurrency c
       where c.coingecko_id = 'wmatic'`
    )

    await queryRunner.query(
      `insert into crypto_wrapped_mapping (cryptocurrency_id, wrapped_cryptocurrency_id)
       select c.id, w.id
       from cryptocurrency c,
            cryptocurrency w
       where w.coingecko_id = 'wmatic'
         and c.coingecko_id = 'matic-network'`
    )

    // Add native coin for BSC
    await queryRunner.query(`insert into cryptocurrency (name, symbol, coingecko_id, is_verified)
                             values ('BNB', 'BNB', 'binancecoin', false)
                             ON CONFLICT ("coingecko_id") DO NOTHING`)
    await queryRunner.query(`insert into cryptocurrency_address
                               (type, address, cryptocurrency_id, decimal, blockchain_id)
                             select 'Coin', null, id, 18, 'bsc'
                             from cryptocurrency
                             where coingecko_id = 'binancecoin'`)

    // Add contract configurations
    await queryRunner.query(`insert into contract_configuration (name, contract_address, blockchain_id,
                                                                 topic0, topic1, topic2, topic3)
                             values ('All Transfers', null, 'bsc',
                                     '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                                     'address_out', 'address_in', null)`)

    await queryRunner.query(`insert into contract_configuration (name, contract_address, blockchain_id,
                                                                 topic0, topic1, topic2, topic3)
                             values ('WBNB Withdrawal', '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', 'bsc',
                                     '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
                                     'address_out', null, null)`)

    await queryRunner.query(`insert into contract_configuration (name, contract_address, blockchain_id,
                                                                 topic0, topic1, topic2, topic3)
                             values ('WBNB Deposit', '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', 'bsc',
                                     '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
                                     'address_in', null, null)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cryptocurrency"
      DROP CONSTRAINT "UQ_4cfaa879c293ed0122e216b885e"`)
    await queryRunner.query(`ALTER TABLE "wallet"
      DROP COLUMN "owned_cryptocurrencies"`)
    await queryRunner.query(`ALTER TABLE "wallet"
      DROP COLUMN "supported_blockchains"`)
    await queryRunner.query(`ALTER TABLE "blockchain"
      DROP COLUMN "coingecko_asset_platform_id"`)
    await queryRunner.query(`ALTER TABLE "blockchain"
      DROP COLUMN "safe_api_url"`)
    await queryRunner.query(`DROP TABLE "polygon_receipt"`)
    await queryRunner.query(`DROP TABLE "polygon_transaction_detail"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_polygon_trace_transaction_hash"`)
    await queryRunner.query(`DROP TABLE "polygon_trace"`)
    await queryRunner.query(`DROP TABLE "polygon_address_transaction"`)
    await queryRunner.query(`DROP TABLE "polygon_log"`)
    await queryRunner.query(`DROP TABLE "bsc_transaction_detail"`)
    await queryRunner.query(`DROP TABLE "bsc_receipt"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_bsc_trace_transaction_hash"`)
    await queryRunner.query(`DROP TABLE "bsc_trace"`)
    await queryRunner.query(`DROP TABLE "bsc_log"`)
    await queryRunner.query(`DROP TABLE "bsc_address_transaction"`)

    await queryRunner.query(`delete
                             from postgres.public.blockchain
                             where public_id = 'polygon'`)
    await queryRunner.query(`delete
                             from postgres.public.cryptocurrency_address
                             where blockchain_id = 'polygon'`)
    await queryRunner.query(`delete
                             from postgres.public.contract_configuration
                             where blockchain_id = 'polygon'`)

    await queryRunner.query(`delete
                             from feature_flag
                             where name = 'wallet_blockchain_configuration'`)

    await queryRunner.query(`delete
                             from crypto_wrapped_mapping
                             where cryptocurrency_id in
                                   (select id from cryptocurrency where coingecko_id = 'matic-network')
                               and wrapped_cryptocurrency_id in
                                   (select id from cryptocurrency where coingecko_id = 'wmatic')`)

    await queryRunner.query(`delete
                             from cryptocurrency_address
                             where cryptocurrency_id in (select id from cryptocurrency where coingecko_id = 'wmatic')
                               and blockchain_id = 'polygon'`)
    await queryRunner.query(`delete
                             from cryptocurrency
                             where coingecko_id = 'wmatic'`)

    //bsc
    await queryRunner.query(`delete
                             from postgres.public.blockchain
                             where public_id = 'bsc'`)
    await queryRunner.query(`delete
                             from postgres.public.cryptocurrency_address
                             where blockchain_id = 'bsc'`)
    await queryRunner.query(`delete
                             from postgres.public.contract_configuration
                             where blockchain_id = 'bsc'`)
  }
}
