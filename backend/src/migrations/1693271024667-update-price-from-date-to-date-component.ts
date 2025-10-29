import { MigrationInterface, QueryRunner } from 'typeorm'

export class updatePriceFromDateToDateComponent1693271024667 implements MigrationInterface {
  name = 'updatePriceFromDateToDateComponent1693271024667'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "price" DROP CONSTRAINT "UQ_price_cryptocurrency_id_date_currency"`)

    await queryRunner.query(`ALTER TABLE "price" ADD "fiat_currency" character varying`)
    await queryRunner.query(`UPDATE "price" SET fiat_currency = UPPER(currency)`)
    await queryRunner.query(`ALTER TABLE "price" ALTER COLUMN "fiat_currency" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "price" DROP COLUMN "currency"`)

    await queryRunner.query(`ALTER TABLE "price" RENAME COLUMN "date" TO "backup_date"`)
    await queryRunner.query(`ALTER TABLE "price" ADD "date" date`)
    await queryRunner.query(`UPDATE "price" SET date = TO_DATE(backup_date, 'DD-MM-YYYY')`)
    await queryRunner.query(`ALTER TABLE "price" ALTER COLUMN "date" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "price" DROP COLUMN "backup_date"`)

    await queryRunner.query(
      `ALTER TABLE "price" ADD CONSTRAINT "UQ_price_cryptocurrency_date_fiatCurrency" UNIQUE ("cryptocurrency_id", "date", "fiat_currency")`
    )

    await queryRunner.query(`insert into feature_flag (name, is_enabled) values ('coingecko_eod_job', false)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from feature_flag where name = 'coingecko_eod_job'`)

    await queryRunner.query(`ALTER TABLE "price" DROP CONSTRAINT "UQ_price_cryptocurrency_date_fiatCurrency"`)

    await queryRunner.query(`ALTER TABLE "price" RENAME COLUMN "date" TO "backup_date"`)
    await queryRunner.query(`ALTER TABLE "price" ADD "date" character varying`)
    await queryRunner.query(`UPDATE "price" SET date = TO_CHAR(backup_date, 'DD-MM-YYYY')`)
    await queryRunner.query(`ALTER TABLE "price" ALTER COLUMN "date" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "price" DROP COLUMN "backup_date"`)

    await queryRunner.query(`ALTER TABLE "price" ADD "currency" character varying`)
    await queryRunner.query(`UPDATE "price" SET currency = LOWER(fiat_currency)`)
    await queryRunner.query(`ALTER TABLE "price" ALTER COLUMN "currency" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "price" DROP COLUMN "fiat_currency"`)

    await queryRunner.query(
      `ALTER TABLE "price" ADD CONSTRAINT "UQ_price_cryptocurrency_id_date_currency" UNIQUE ("date", "currency", "cryptocurrency_id")`
    )
  }
}
