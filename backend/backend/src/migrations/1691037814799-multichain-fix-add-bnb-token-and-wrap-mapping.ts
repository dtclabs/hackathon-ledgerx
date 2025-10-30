import { MigrationInterface, QueryRunner } from 'typeorm'

export class multichainFixAddBnbTokenAndWrapMapping1691037814799 implements MigrationInterface {
  name = 'multichainFixAddBnbTokenAndWrapMapping1691037814799'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bsc_address_transaction" DROP CONSTRAINT "UQ_bsc_address_transaction_hash_blockchain_address_configuratio"`
    )
    await queryRunner.query(
      `ALTER TABLE "polygon_address_transaction" DROP CONSTRAINT "UQ_polygon_address_transaction_hash_blockchain_address_configur"`
    )
    await queryRunner.query(
      `ALTER TABLE "bsc_address_transaction" ADD CONSTRAINT "UQ_bsc_address_transaction_hash_blockchain_address_config" UNIQUE ("hash", "blockchain_id", "address", "contract_configuration_id")`
    )
    await queryRunner.query(
      `ALTER TABLE "polygon_address_transaction" ADD CONSTRAINT "UQ_polygon_address_transaction_hash_blockchain_address_config" UNIQUE ("hash", "blockchain_id", "address", "contract_configuration_id")`
    )

    await queryRunner.query(
      `insert into cryptocurrency (name, symbol, coingecko_id, is_verified)
       values ('Wrapped BNB', 'WBNB', 'wbnb', false)`
    )

    await queryRunner.query(
      `insert into cryptocurrency_address (type, address, cryptocurrency_id, "decimal", blockchain_id)
       select 'Token', '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', c.id, 18, 'bsc'
       from cryptocurrency c
       where c.coingecko_id = 'wbnb'`
    )

    await queryRunner.query(
      `insert into crypto_wrapped_mapping (cryptocurrency_id, wrapped_cryptocurrency_id)
       select c.id, w.id
       from cryptocurrency c,
            cryptocurrency w
       where w.coingecko_id = 'wbnb'
         and c.coingecko_id = 'binancecoin'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "polygon_address_transaction" DROP CONSTRAINT "UQ_polygon_address_transaction_hash_blockchain_address_config"`
    )
    await queryRunner.query(
      `ALTER TABLE "bsc_address_transaction" DROP CONSTRAINT "UQ_bsc_address_transaction_hash_blockchain_address_config"`
    )
    await queryRunner.query(
      `ALTER TABLE "polygon_address_transaction" ADD CONSTRAINT "UQ_polygon_address_transaction_hash_blockchain_address_configur" UNIQUE ("hash", "blockchain_id", "address", "contract_configuration_id")`
    )
    await queryRunner.query(
      `ALTER TABLE "bsc_address_transaction" ADD CONSTRAINT "UQ_bsc_address_transaction_hash_blockchain_address_configuratio" UNIQUE ("hash", "blockchain_id", "address", "contract_configuration_id")`
    )
  }
}
