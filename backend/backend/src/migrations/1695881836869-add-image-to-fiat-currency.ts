import { MigrationInterface, QueryRunner } from 'typeorm'

export class addImageToFiatCurrency1695881836869 implements MigrationInterface {
  name = 'addImageToFiatCurrency1695881836869'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fiat_currency" ADD "image" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fiat_currency" DROP COLUMN "image"`)
  }
}
