import { MigrationInterface, QueryRunner } from 'typeorm'

export class addNotesToPendingTransaction1698047314040 implements MigrationInterface {
  name = 'addNotesToPendingTransaction1698047314040'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pending_transaction" ADD "notes" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pending_transaction" DROP COLUMN "notes"`)
  }
}
