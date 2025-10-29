import { MigrationInterface, QueryRunner } from 'typeorm'

export class addTransactionStatusToRawTransactionTable1681333273857 implements MigrationInterface {
  name = 'addTransactionStatusToRawTransactionTable1681333273857'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "raw_transaction" ADD "transaction_status" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "raw_transaction" ADD "transaction_status_reason" character varying`)
    await queryRunner.query(`ALTER TABLE "raw_transaction" DROP COLUMN "status"`)
    await queryRunner.query(`DROP TYPE "raw_transaction_status_enum"`)
    await queryRunner.query(`ALTER TABLE "raw_transaction" ADD "status" character varying NOT NULL DEFAULT 'running'`)

    // Seed this transaction https://etherscan.io/tx/0x9c81f44c29ff0226f835cd0a8a2f2a7eca6db52a711f8211b566fd15d3e0e8d4
    await queryRunner.query(`INSERT INTO public.raw_transaction
        (created_at, updated_at, deleted_at, hash, address, block_number, block_timestamp, ingestion_task_id, receipt, "to", "from", status, internal, blockchain_id, block_number_int, transaction_status, transaction_status_reason)
        VALUES(now(), now(), NULL, '0x9c81f44c29ff0226f835cd0a8a2f2a7eca6db52a711f8211b566fd15d3e0e8d4', '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae', '0xd34c', '2015-08-08T15:44:00.000Z', '0', '{"to":"0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae","from":"0x5AbFEc25f74Cd88437631a7731906932776356f9","contractAddress":"0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe","transactionIndex":0,"root":"0x1a47682428b047bbb5bd37ba5e33a7822872853b94e3262cb0703ee536f9ad3b","gasUsed":{"type":"BigNumber","hex":"0x15ed23"},"logsBloom":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","blockHash":"0xd3cabad6adab0b52eb632c386ea194036805713682c62cb589b5abcd76de2159","transactionHash":"0x9c81f44c29ff0226f835cd0a8a2f2a7eca6db52a711f8211b566fd15d3e0e8d4","logs":[],"blockNumber":54092,"confirmations":16971804,"cumulativeGasUsed":{"type":"BigNumber","hex":"0x15ed23"},"effectiveGasPrice":{"type":"BigNumber","hex":"0x09184e72a000"},"type":0}'::json, null, '[{"blockNum":"0xd34c","uniqueId":"0x9c81f44c29ff0226f835cd0a8a2f2a7eca6db52a711f8211b566fd15d3e0e8d4:external","hash":"0x9c81f44c29ff0226f835cd0a8a2f2a7eca6db52a711f8211b566fd15d3e0e8d4","from":"0x5abfec25f74cd88437631a7731906932776356f9","to":"0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae","value":11901464.23948,"erc721TokenId":null,"erc1155Metadata":null,"tokenId":null,"asset":"ETH","category":"external","rawContract":{"value":"0x9d83bab515b08642f8000","address":null,"decimal":"0x12"},"metadata":{"blockTimestamp":"2015-08-08T15:44:00.000Z"}}]'::json, 'completed', '[]'::json, 'ethereum', 54092, 'success', null)`)

    await queryRunner.query(`INSERT INTO public.raw_transaction
        (created_at, updated_at, deleted_at, hash, address, block_number, block_timestamp, ingestion_task_id, receipt, "to", "from", status, internal, blockchain_id, block_number_int, transaction_status, transaction_status_reason)
        VALUES(now(), now(), NULL, '0x9c81f44c29ff0226f835cd0a8a2f2a7eca6db52a711f8211b566fd15d3e0e8d4', '0x5abfec25f74cd88437631a7731906932776356f9', '0xd34c', '2015-08-08T15:44:00.000Z', '0', null, '{"to":"0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae","from":"0x5AbFEc25f74Cd88437631a7731906932776356f9","contractAddress":"0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe","transactionIndex":0,"root":"0x1a47682428b047bbb5bd37ba5e33a7822872853b94e3262cb0703ee536f9ad3b","gasUsed":{"type":"BigNumber","hex":"0x15ed23"},"logsBloom":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","blockHash":"0xd3cabad6adab0b52eb632c386ea194036805713682c62cb589b5abcd76de2159","transactionHash":"0x9c81f44c29ff0226f835cd0a8a2f2a7eca6db52a711f8211b566fd15d3e0e8d4","logs":[],"blockNumber":54092,"confirmations":16971804,"cumulativeGasUsed":{"type":"BigNumber","hex":"0x15ed23"},"effectiveGasPrice":{"type":"BigNumber","hex":"0x09184e72a000"},"type":0}'::json, '[{"blockNum":"0xd34c","uniqueId":"0x9c81f44c29ff0226f835cd0a8a2f2a7eca6db52a711f8211b566fd15d3e0e8d4:external","hash":"0x9c81f44c29ff0226f835cd0a8a2f2a7eca6db52a711f8211b566fd15d3e0e8d4","from":"0x5abfec25f74cd88437631a7731906932776356f9","to":"0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae","value":11901464.23948,"erc721TokenId":null,"erc1155Metadata":null,"tokenId":null,"asset":"ETH","category":"external","rawContract":{"value":"0x9d83bab515b08642f8000","address":null,"decimal":"0x12"},"metadata":{"blockTimestamp":"2015-08-08T15:44:00.000Z"}}]'::json, 'completed', '[]'::json, 'ethereum', 54092, 'success', null)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "raw_transaction" DROP COLUMN "status"`)
    await queryRunner.query(`CREATE TYPE "public"."raw_transaction_status_enum" AS ENUM('RUNNING', 'COMPLETED')`)
    await queryRunner.query(
      `ALTER TABLE "raw_transaction" ADD "status" "public"."raw_transaction_status_enum" DEFAULT 'RUNNING'`
    )
    await queryRunner.query(`ALTER TABLE "raw_transaction" DROP COLUMN "transaction_status_reason"`)
    await queryRunner.query(`ALTER TABLE "raw_transaction" DROP COLUMN "transaction_status"`)
  }
}
