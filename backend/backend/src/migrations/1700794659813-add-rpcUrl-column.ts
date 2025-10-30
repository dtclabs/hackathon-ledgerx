import { MigrationInterface, QueryRunner } from 'typeorm'

const RPC_URL_MAP = {
  ethereum: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  goerli: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  polygon: 'https://polygon-rpc.com',
  bsc: 'https://bsc-dataseed1.binance.org',
  arbitrum_one: 'https://arb1.arbitrum.io/rpc'
}

export class addRpcUrlColumn1700794659813 implements MigrationInterface {
  name = 'addRpcUrlColumn1700794659813'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blockchain" ADD "rpc_url" character varying`)

    for (const [blockchainPublicId, rpcUrl] of Object.entries(RPC_URL_MAP)) {
      await queryRunner.query(
        `UPDATE "blockchain" set rpc_url = '${rpcUrl}' where "public_id" = '${blockchainPublicId}'`
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blockchain" DROP COLUMN "rpc_url"`)
  }
}
