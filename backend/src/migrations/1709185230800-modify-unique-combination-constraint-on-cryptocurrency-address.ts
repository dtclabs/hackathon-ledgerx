import { MigrationInterface, QueryRunner } from 'typeorm'

export class modifyUniqueCombinationConstraintOnCryptocurrencyAddress1709185230800 implements MigrationInterface {
  name = 'modifyUniqueCombinationConstraintOnCryptocurrencyAddress1709185230800'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_cryptocurrency_address_chain_address_type"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_cryptocurrency_address_chain_address_type" ON "cryptocurrency_address" ("address", "type", "blockchain_id") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_cryptocurrency_address_chain_address_type"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_cryptocurrency_address_chain_address_type" ON "cryptocurrency_address" ("type", "address") `
    )
  }
}
