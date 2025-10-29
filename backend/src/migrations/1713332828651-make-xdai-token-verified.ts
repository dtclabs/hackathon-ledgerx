import { MigrationInterface, QueryRunner } from 'typeorm'

export class makeXdaiTokenVerified1713332828651 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = true
                             where coingecko_id = 'xdai'`)

    await queryRunner.query(
      `insert into token (name)
       select 'XDAI'
       where not exists (select 1 from token where name = 'XDAI')`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM token where name = 'XDAI'`)
    await queryRunner.query(`UPDATE cryptocurrency
                             set is_verified = false
                             where coingecko_id = 'xdai'`)
  }
}
