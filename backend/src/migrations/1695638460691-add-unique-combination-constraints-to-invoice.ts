import { MigrationInterface, QueryRunner } from 'typeorm'

export class addUniqueCombinationConstraintsToInvoice1695638460691 implements MigrationInterface {
  name = 'addUniqueCombinationConstraintsToInvoice1695638460691'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_invoice_number_source_organization_id" ON "invoice" ("invoice_number", "source", "organization_id") WHERE role = 'seller' AND deleted_at IS NULL`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_source_id_source_organization_id" ON "invoice" ("source_id", "source", "organization_id") WHERE deleted_at IS NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_source_id_source_organization_id"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_invoice_number_source_organization_id"`)
  }
}
