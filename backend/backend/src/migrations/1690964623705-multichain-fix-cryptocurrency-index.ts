import { MigrationInterface, QueryRunner } from 'typeorm'

export class multichainFixCryptocurrencyIndex1690964623705 implements MigrationInterface {
  name = 'multichainFixCryptocurrencyIndex1690964623705'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cryptocurrency" DROP CONSTRAINT "UQ_4cfaa879c293ed0122e216b885e"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_cryptocurrency_coingecko_id" ON "cryptocurrency" ("coingecko_id") WHERE "deleted_at" IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_cryptocurrency_coingecko_id"`)
    await queryRunner.query(
      `ALTER TABLE "cryptocurrency" ADD CONSTRAINT "UQ_4cfaa879c293ed0122e216b885e" UNIQUE ("coingecko_id")`
    )
  }
}
