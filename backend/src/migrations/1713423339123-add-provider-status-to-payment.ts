import { MigrationInterface, QueryRunner } from 'typeorm'

export class addProviderStatusToPayment1713423339123 implements MigrationInterface {
  name = 'addProviderStatusToPayment1713423339123'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" ADD "provider_status" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "provider_status"`)
  }
}
