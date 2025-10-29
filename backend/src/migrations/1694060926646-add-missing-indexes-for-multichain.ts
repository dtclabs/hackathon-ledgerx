import { MigrationInterface, QueryRunner } from 'typeorm'

export class addMissingIndexesForMultichain1694060926646 implements MigrationInterface {
  name = 'addMissingIndexesForMultichain1694060926646'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_bsc_address_transaction_address_blockchain_status" ON "bsc_address_transaction" ("address", "blockchain_id", "status") WHERE deleted_at IS NULL`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_polygon_address_transaction_address_blockchain_status" ON "polygon_address_transaction" ("address", "blockchain_id", "status") WHERE deleted_at IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_polygon_address_transaction_address_blockchain_status"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_bsc_address_transaction_address_blockchain_status"`)
  }
}
