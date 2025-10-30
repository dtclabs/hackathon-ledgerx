import { MigrationInterface, QueryRunner } from 'typeorm'

export class renameCoaToCorrespodingCoa1690437760585 implements MigrationInterface {
  name = 'renameCoaToCorrespodingCoa1690437760585'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "financial_transaction_child_metadata" DROP CONSTRAINT "FK_d10ee7caad116f26fe11be04a94"`
    )
    await queryRunner.query(
      `ALTER TABLE "financial_transaction_child_metadata" RENAME COLUMN "coa_id" TO "corresponding_coa_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "financial_transaction_child_metadata" ADD "corresponding_coa_updated_by" character varying`
    )

    await queryRunner.query(
      `ALTER TABLE "financial_transaction_child_metadata" ADD CONSTRAINT "FK_b9acb2a9b6b64965d37c70daab9" FOREIGN KEY ("corresponding_coa_id") REFERENCES "chart_of_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(`ALTER TABLE "temp_transactions_entity" DROP CONSTRAINT "FK_736ad46bf4ae4918a4ce067ec83"`)
    await queryRunner.query(`ALTER TABLE "temp_transactions_entity" RENAME COLUMN "coa_id" TO "corresponding_coa_id"`)
    await queryRunner.query(
      `ALTER TABLE "temp_transactions_entity" ADD CONSTRAINT "FK_be216dae1281daa25be139a0934" FOREIGN KEY ("corresponding_coa_id") REFERENCES "chart_of_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "temp_transactions_entity" DROP CONSTRAINT "FK_be216dae1281daa25be139a0934"`)
    await queryRunner.query(`ALTER TABLE "temp_transactions_entity" RENAME COLUMN "corresponding_coa_id" TO "coa_id"`)
    await queryRunner.query(
      `ALTER TABLE "temp_transactions_entity" ADD CONSTRAINT "FK_736ad46bf4ae4918a4ce067ec83" FOREIGN KEY ("coa_id") REFERENCES "chart_of_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "financial_transaction_child_metadata" RENAME COLUMN "corresponding_coa_id" TO "coa_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "financial_transaction_child_metadata" DROP CONSTRAINT "FK_b9acb2a9b6b64965d37c70daab9"`
    )
    await queryRunner.query(
      `ALTER TABLE "financial_transaction_child_metadata" ADD CONSTRAINT "FK_d10ee7caad116f26fe11be04a94" FOREIGN KEY ("coa_id") REFERENCES "chart_of_account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )

    await queryRunner.query(
      `ALTER TABLE "financial_transaction_child_metadata" DROP COLUMN "corresponding_coa_updated_by"`
    )
  }
}
