import { MigrationInterface, QueryRunner } from 'typeorm'

export class makeEduTokenVerified1710476298464 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = true
                             where coingecko_id = 'edu-coin'`)

    await queryRunner.query(
      `insert into token (name)
       select 'EDU'
       where not exists (select 1 from token where name = 'EDU')`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM token where name = 'EDU'`)
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = false
                             where coingecko_id = 'edu-coin'`)
  }
}
