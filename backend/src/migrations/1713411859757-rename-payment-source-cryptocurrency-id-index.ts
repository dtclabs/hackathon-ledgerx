import { MigrationInterface, QueryRunner } from 'typeorm'

export class renamePaymentSourceCryptocurrencyIdIndex1713411859757 implements MigrationInterface {
  name = 'renamePaymentSourceCryptocurrencyIdIndex1713411859757'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" DROP CONSTRAINT "FK_payment_source_cryptocurrency_id_cryptocurrency"`
    )
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_1ab2c10897125946da30ae75a49" FOREIGN KEY ("source_cryptocurrency_id") REFERENCES "cryptocurrency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_1ab2c10897125946da30ae75a49"`)
    await queryRunner.query(
      `ALTER TABLE "payment" ADD CONSTRAINT "FK_payment_source_cryptocurrency_id_cryptocurrency" FOREIGN KEY ("source_cryptocurrency_id") REFERENCES "cryptocurrency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}
