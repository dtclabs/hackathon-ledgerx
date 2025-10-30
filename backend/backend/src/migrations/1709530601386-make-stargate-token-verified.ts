import { MigrationInterface, QueryRunner } from 'typeorm'

export class makeStargateTokenVerified1709530601386 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = true
                             where coingecko_id = 'stargate-finance'`)

    await queryRunner.query(
      `insert into token (name)
       select 'STG'
       where not exists (select 1 from token where name = 'STG')`
    )

    // All previous tokens we toggle to verified
    // ParagonsDAO
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = true
                             where coingecko_id = 'paragonsdao'`)
    await queryRunner.query(
      `insert into token (name)
       select 'PDT'
       where not exists (select 1 from token where name = 'PDT')`
    )

    // Wrapped NXM
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = true
                             where coingecko_id = 'wrapped-nxm'`)
    await queryRunner.query(
      `insert into token (name)
       select 'WNXM'
       where not exists (select 1 from token where name = 'WNXM')`
    )

    // BlockchainSpace
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = true
                             where coingecko_id = 'blockchainspace'`)
    await queryRunner.query(
      `insert into token (name)
       select 'GUILD'
       where not exists (select 1 from token where name = 'GUILD')`
    )

    // SAND
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = true
                             where coingecko_id = 'the-sandbox'`)
    await queryRunner.query(
      `insert into token (name)
       select 'SAND'
       where not exists (select 1 from token where name = 'SAND')`
    )

    // Developer DAO
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = true
                             where coingecko_id = 'developer-dao'`)
    await queryRunner.query(
      `insert into token (name)
       select 'CODE'
       where not exists (select 1 from token where name = 'CODE')`
    )

    // SO-COL
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = true
                             where coingecko_id = 'socol'`)
    await queryRunner.query(
      `insert into token (name)
       select 'SIMP'
       where not exists (select 1 from token where name = 'SIMP')`
    )

    // Mantle
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = true
                             where coingecko_id = 'mantle'`)
    await queryRunner.query(
      `insert into token (name)
       select 'MNT'
       where not exists (select 1 from token where name = 'MNT')`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Mantle
    await queryRunner.query(`DELETE FROM token where name = 'MNT'`)
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = false
                             where coingecko_id = 'mantle'`)

    // SO-COL
    await queryRunner.query(`DELETE FROM token where name = 'SIMP'`)
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = false
                             where coingecko_id = 'socol'`)

    // Developer DAO
    await queryRunner.query(`DELETE FROM token where name = 'CODE'`)
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = false
                             where coingecko_id = 'developer-dao'`)

    // SAND
    await queryRunner.query(`DELETE FROM token where name = 'SAND'`)
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = false
                             where coingecko_id = 'the-sandbox'`)

    // BlockchainSpace
    await queryRunner.query(`DELETE FROM token where name = 'GUILD'`)
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = false
                             where coingecko_id = 'blockchainspace'`)

    // Wrapped NXM
    await queryRunner.query(`DELETE FROM token where name = 'WNXM'`)
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = false
                             where coingecko_id = 'wrapped-nxm'`)

    // ParagonsDAO
    await queryRunner.query(`DELETE FROM token where name = 'PDT'`)
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = false
                             where coingecko_id = 'paragonsdao'`)

    await queryRunner.query(`DELETE FROM token where name = 'STG'`)
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = false
                             where coingecko_id = 'stargate-finance'`)
  }
}
