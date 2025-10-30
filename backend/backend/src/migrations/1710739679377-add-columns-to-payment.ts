import { MigrationInterface, QueryRunner } from 'typeorm'

export class addColumnsToPayment1710739679377 implements MigrationInterface {
  name = 'addColumnsToPayment1710739679377'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" ADD "destination_currency_type" character varying`)
    await queryRunner.query(`ALTER TABLE "payment" ADD "destination_currency_id" bigint`)
    await queryRunner.query(`ALTER TABLE "payment" ADD "source_amount" character varying`)
    await queryRunner.query(`ALTER TABLE "payment" ADD "destination_amount" character varying`)
    await queryRunner.query(`ALTER TABLE "payment" ADD "provider" character varying`)
    await queryRunner.query(`ALTER TABLE "payment" ADD "source_cryptocurrency_id" bigint`)
    await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "destination_address" DROP NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_payment_source_cryptocurrency_id_cryptocurrency" FOREIGN KEY ("source_cryptocurrency_id") REFERENCES "cryptocurrency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `UPDATE "payment" SET source_cryptocurrency_id = cryptocurrency_id, destination_currency_type = 'crypto', destination_currency_id = cryptocurrency_id WHERE cryptocurrency_id IS NOT NULL`
    )
    await queryRunner.query(
      `UPDATE "payment" SET source_amount = amount, destination_amount = amount WHERE amount IS NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_payment_source_cryptocurrency_id_cryptocurrency"`
    )
    await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "destination_address" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "source_cryptocurrency_id"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "provider"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "destination_amount"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "source_amount"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "destination_currency_id"`)
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "destination_currency_type"`)
  }
}
