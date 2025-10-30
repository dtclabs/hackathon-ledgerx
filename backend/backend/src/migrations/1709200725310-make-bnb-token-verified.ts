import { MigrationInterface, QueryRunner } from 'typeorm'

export class makeBnbTokenVerified1709200725310 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = true
                             where id in (select cryptocurrency_id from cryptocurrency_address where type = 'Coin' and blockchain_id = 'bsc')`)

    await queryRunner.query(`SELECT setval('token_id_seq',(select max(id) from token), true)`)
    await queryRunner.query(
      `insert into token (name)
       select 'BNB'
       where not exists (select 1 from token where name = 'BNB')`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM token where name = 'BNB'`)
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = false
                             where id in (select cryptocurrency_id from cryptocurrency_address where type = 'Coin' and blockchain_id = 'bsc')`)
  }
}
