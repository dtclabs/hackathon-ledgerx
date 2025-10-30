import { MigrationInterface, QueryRunner } from 'typeorm'

export class multichainFixCryptocurrencyIndex1690968950341 implements MigrationInterface {
  name = 'multichainFixCryptocurrencyIndex1690968950341'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blockchain"
        RENAME COLUMN "safe_api_url" TO "safe_url"`)

    await queryRunner.query(`update blockchain
                             set safe_url = 'https://safe-transaction-mainnet.safe.global'
                             where public_id = 'ethereum'`)
    await queryRunner.query(`update blockchain
                             set safe_url = 'https://safe-transaction-goerli.safe.global'
                             where public_id = 'goerli'`)
    await queryRunner.query(`update blockchain
                             set safe_url = 'https://safe-transaction-polygon.safe.global'
                             where public_id = 'polygon'`)
    await queryRunner.query(`update blockchain
                             set safe_url = 'https://safe-transaction.bsc.gnosis.io'
                             where public_id = 'bsc'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blockchain"
        RENAME COLUMN "safe_url" TO "safe_api_url"`)
  }
}
