import { MigrationInterface, QueryRunner } from 'typeorm'

export class addUniqueCombinationConstraintToPendingTransaction1702885047213 implements MigrationInterface {
  name = 'addUniqueCombinationConstraintToPendingTransaction1702885047213'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pending_transaction" DROP CONSTRAINT "UQ_pending_transaction_safe_hash"`)
    await queryRunner.query(
      `ALTER TABLE "pending_transaction" ADD CONSTRAINT "UQ_pending_transaction_safe_hash_organization" UNIQUE ("safe_hash", "organization_id")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pending_transaction" DROP CONSTRAINT "UQ_pending_transaction_safe_hash_organization"`
    )
    await queryRunner.query(
      `ALTER TABLE "pending_transaction" ADD CONSTRAINT "UQ_pending_transaction_safe_hash" UNIQUE ("safe_hash")`
    )
  }
}
