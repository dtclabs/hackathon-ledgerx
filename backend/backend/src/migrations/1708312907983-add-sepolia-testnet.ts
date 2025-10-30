import { MigrationInterface, QueryRunner } from 'typeorm'

export class addSepoliaTestnet1708312907983 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "blockchain" ("public_id", "name", "chain_id", "is_enabled", "is_testnet",
        "block_explorer", "api_url", "image_url", "safe_url", "coingecko_asset_platform_id", "request_finance_name", "rpc_url")
VALUES ('sepolia', 'Sepolia', 11155111, false, true, 'https://sepolia.etherscan.io/',
'https://api-sepolia.etherscan.io/api', 'https://hq-backend-dev-public.s3.ap-southeast-1.amazonaws.com/blockchain-images/sepolia.png',
'https://safe-transaction-sepolia.safe.global', null, 'sepolia', 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161')`)

    const ethererumCryptocurrencyId = await queryRunner.query(
      `SELECT id FROM "cryptocurrency" WHERE "name" = 'Ethereum' and "is_verified" = true`
    )
    await queryRunner.query(
      `INSERT INTO "cryptocurrency_address"("created_at", "updated_at", "deleted_at", "type", "address", "cryptocurrency_id", "decimal", "blockchain_id") VALUES (DEFAULT, DEFAULT, DEFAULT, 'Coin', null, '${ethererumCryptocurrencyId[0].id}', 18, 'sepolia' )`
    )
    await queryRunner.query(`UPDATE "blockchain" SET is_enabled = false WHERE public_id = 'goerli'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "blockchain" SET is_enabled = true WHERE public_id = 'goerli'`)
    await queryRunner.query(`DELETE FROM "cryptocurrency_address" where "blockchain_id" = 'sepolia'`)
    await queryRunner.query(`DELETE FROM "blockchain" where "public_id" = 'sepolia'`)
  }
}
