import { MigrationInterface, QueryRunner } from 'typeorm'

export class addMissingRpcToOptimism1709707722157 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE blockchain
                             set rpc_url = 'https://mainnet.optimism.io'
                             where public_id = 'optimism'`)

    await queryRunner.query(
      `insert into cryptocurrency_address (type, address, cryptocurrency_id, blockchain_id, decimal)
       select 'Token',
              '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
              (select id from cryptocurrency where coingecko_id = 'usd-coin'),
              'sepolia',
              6
       where not exists (select 1
                         from cryptocurrency_address
                         where address = '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238'
                           and blockchain_id = 'sepolia')`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `delete
       from cryptocurrency_address
       where address = '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238'
         and blockchain_id = 'sepolia'`
    )
    await queryRunner.query(`UPDATE blockchain
                             set rpc_url = null
                             where public_id = 'optimism'`)
  }
}
