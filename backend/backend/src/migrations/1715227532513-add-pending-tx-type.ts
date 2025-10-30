import { MigrationInterface, QueryRunner } from 'typeorm'

export class addPendingTxType1715227532513 implements MigrationInterface {
  name = 'addPendingTxType1715227532513'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pending_transaction" ADD "type" character varying`)
    await queryRunner.query(`ALTER TABLE "pending_transaction" ADD "error" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pending_transaction" DROP COLUMN "error"`)
    await queryRunner.query(`ALTER TABLE "pending_transaction" DROP COLUMN "type"`)
  }
}
