import { MigrationInterface, QueryRunner } from 'typeorm'

export class addedIndexForPendingTxs1681454791920 implements MigrationInterface {
  name = 'addedIndexForPendingTxs1681454791920'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `Delete
       from pending_transaction
       where safe_hash in (select safe_hash from pending_transaction group by safe_hash having count(*) > 1)`
    )
    await queryRunner.query(
      `ALTER TABLE "pending_transaction"
        ADD CONSTRAINT "UQ_pending_transaction_safe_hash" UNIQUE ("safe_hash")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pending_transaction"
      DROP CONSTRAINT "UQ_pending_transaction_safe_hash"`)
  }
}
