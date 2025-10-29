import { MigrationInterface, QueryRunner } from 'typeorm'

export class migrateSourceIdToInvoiceNumber1694660618385 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE invoice SET invoice_number = source_id WHERE invoice_number IS NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
